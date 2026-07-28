/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as path from 'path';
import * as vscode from 'vscode';

export function get<T>(key: string): T | undefined {
  return substitute(vscode.workspace.getConfiguration('clangd').get<T>(key));
}

export function getSecure<T>(key: string, workspaceState: vscode.Memento): T | undefined {
  const prop = new SecureProperty<T>(key, workspaceState);
  return prop.get(prop.blessed ?? false);
}

export async function getSecureOrPrompt<T>(key: string, workspaceState: vscode.Memento): Promise<T | undefined> {
  const prop = new SecureProperty<T>(key, workspaceState);
  if (!prop.mismatched) {
    return prop.get(false);
  }
  const blessed = prop.blessed;
  if (blessed !== undefined) {
    return prop.get(blessed);
  }
  const Yes = 'Yes, use this setting';
  const No = 'No, use my default';
  switch (
    await vscode.window.showWarningMessage(
      `This workspace wants to set clangd.${key} to ${prop.insecureJSON}.
    \u2029
    This will override your default of ${prop.secureJSON}.`,
      Yes,
      No,
    )
  ) {
    case Yes:
      await prop.bless(true);
      return prop.get(true);
    case No:
      await prop.bless(false);
      break;
    default:
      break;
  }
  return prop.get(false);
}

export function update<T>(key: string, value: T, target?: vscode.ConfigurationTarget): Thenable<void> {
  return vscode.workspace.getConfiguration('clangd').update(key, value, target);
}

function substitute<T>(val: T): T {
  let res = val;
  if (typeof val === 'string') {
    res = val.replace(/\$\{(.*?)\}/g, (match, name) => {
      return replacement(name) ?? match;
    }) as unknown as T;
  } else if (Array.isArray(val)) {
    res = val.map((x) => substitute(x)) as unknown as T;
  } else if (typeof val === 'object') {
    const result = {} as { [k: string]: any };
    for (let [k, v] of Object.entries(val)) {
      result[k] = substitute(v);
    }
    res = result as T;
  } else {
    // do nothing
  }
  return res;
}

function replacement(name: string): string | undefined {
  if (name === 'workspaceFolder' || name === 'workspaceRoot' || name === 'cwd') {
    if (vscode.workspace.rootPath !== undefined) {
      // the first priority is to obtain the root path.
      return vscode.workspace.rootPath;
    } else if (vscode.window.activeTextEditor !== undefined) {
      // get activeTextEditor
      return path.dirname(vscode.window.activeTextEditor.document.uri.fsPath);
    } else {
      return process.cwd();
    }
  }
  const envString = 'env:';
  if (name.startsWith(envString)) {
    return process.env[name.substr(envString.length)] ?? '';
  }
  const configString = 'config:';
  if (name.startsWith(configString)) {
    const config = vscode.workspace.getConfiguration().get(name.substr(configString.length));
    return typeof config === 'string' ? config : undefined;
  }
  return undefined;
}

interface BlessCache {
  json: string;
  allowed: boolean;
}

class SecureProperty<T> {
  public secureJSON: string;
  public insecureJSON: string;
  secure?: T;
  insecure?: T;
  blessKey: string;

  constructor(
    key: string,
    private workspaceState: vscode.Memento,
  ) {
    const cfg = vscode.workspace.getConfiguration('clangd');
    const inspect = cfg.inspect<T>(key);
    if (inspect) {
      this.secureJSON = JSON.stringify(this.secure);
      this.insecureJSON = JSON.stringify(this.insecure);
      this.secure = inspect.globalValue ?? inspect.defaultValue;
      this.insecure = cfg.get<T>(key);
      this.blessKey = `bless.${key}`;
    }
  }

  get blessed(): boolean | undefined {
    let cache = this.workspaceState.get<BlessCache>(this.blessKey);
    if (!cache || cache.json !== this.insecureJSON) {
      return undefined;
    }
    return cache.allowed;
  }

  get mismatched(): boolean {
    return this.secureJSON !== this.insecureJSON;
  }

  async bless(b: boolean): Promise<void> {
    await this.workspaceState.update(this.blessKey, { json: this.insecureJSON, allowed: b });
  }

  get(trusted: boolean): T | undefined {
    return substitute(trusted ? this.insecure : this.secure);
  }
}