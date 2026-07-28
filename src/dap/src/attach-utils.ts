/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {QuickPickItem} from 'vscode';
import * as vscode from 'vscode';
import {execNativeCommand, getOs} from './common-utils';
import * as os from 'os';
import {OS} from "./types";

export class ProcessPickItem implements QuickPickItem {
  private static readonly NEED_REMOVE_PREFIX_ON_WIN_ARR = ['\\??\\', '\\\\?\\'];

  label: string;
  pid: number;
  description: string;
  detail: string;

  constructor(label: string, pid: number, description: string, detail: string) {
    this.label = label;
    this.pid = pid;
    this.description = description;
    this.detail = detail;
  }

  public getProgramPath(): string {
    if (!this.detail) {
      return undefined;
    }
    let program;
    const [first] = this.detail.split(' ');
    if (getOs() === 'win') {
      if (this.detail.startsWith('\"')) {
        program = this.detail.substring(1);
        program = program.substring(0, program.indexOf('\"'));
      } else {
        program = first;
      }
      for (const prefix of ProcessPickItem.NEED_REMOVE_PREFIX_ON_WIN_ARR) {
        if (program.startsWith(prefix)) {
          program = program.substring(prefix.length);
          break;
        }
      }
    } else {
      program = first;
    }
    return program;
  }
}

let lastSelectedProcessName: string = null;

export async function pickNativeProcess(): Promise<ProcessPickItem> {
  let items: ProcessPickItem[];
  let currentOs: OS = getOs();
  if (currentOs === 'win') {
    items = await listProcessOnWin();
  } else if (currentOs === 'linux') {
    items = await listProcessOnLinux();
  } else {
    items = await listProcessOnMac();
  }
  const findLast = items.findIndex(item => item.label === lastSelectedProcessName);
  if (findLast >= 0) {
    const foundArr = items.slice(findLast, findLast + 1);
    items.splice(0, 0, foundArr[0]);
  }
  const selected = await vscode.window.showQuickPick(items);
  if (!selected) {
    throw new Error('process not selected');
  }
  lastSelectedProcessName = selected.label;
  return selected;
}

async function listProcessOnWin(): Promise<ProcessPickItem[]> {
  let cmdResult = await execNativeCommand('wmic process get Name,ProcessId,CommandLine /FORMAT:list');
  const lineArr = cmdResult.split(os.EOL);
  let result: ProcessPickItem[] = [];
  for (const line of lineArr) {
    if (!line) {
      continue;
    }
    const equalsIdx = line.indexOf('=');
    if (equalsIdx > 0) {
      const key = line.slice(0, equalsIdx).trim();
      let val = line.slice(equalsIdx + 1).trim();
      switch (key) {
        case 'CommandLine':
          result.push(new ProcessPickItem(null, 0, null, val));
          break;
        case 'Name':
          result[result.length - 1].label = val;
          break;
        case 'ProcessId':
          result[result.length - 1].pid = parseInt(val);
          result[result.length - 1].description = val;
          break;
        default:
          break;
      }
    }
  }
  result = result.filter(item => item.detail && item.detail.length > 0);
  result.sort((a, b) => a.pid - b.pid);
  return result;
}

async function listProcessOnLinux(): Promise<ProcessPickItem[]> {
  return await listProcessOnUnix('ps -awwxo pid,cmd');
}

async function listProcessOnMac(): Promise<ProcessPickItem[]> {
  return await listProcessOnUnix('ps -awwxo pid,comm');
}

async function listProcessOnUnix(cmd: string): Promise<ProcessPickItem[]> {
  let output: string = await execNativeCommand(cmd);
  let lines: string[] = output.trim().split('\n');
  lines.shift();
  let processes = lines.map((eachLine) => {
    let line: string = eachLine;
    line = line.trim();
    let indexOfSpace: number = line.indexOf(' ');
    let pid: number = Number.parseInt(line.substring(0, indexOfSpace));
    let cmd: string = line.substring(indexOfSpace + 1);
    const [first] = cmd.split(' ');
    let nameOrPath: string = first;
    if (nameOrPath.startsWith('[') && nameOrPath.endsWith(']')) {
      nameOrPath = nameOrPath.substring(1, nameOrPath.length - 1);
    }
    let name: string = nameOrPath.substring(nameOrPath.lastIndexOf('/') + 1);
    return {name, pid, cmd};
  });
  return processes.map(p => new ProcessPickItem(p.name, p.pid, p.pid.toString(), p.cmd));
}