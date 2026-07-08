/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import type { CjpmBuildArgs } from '../util/cjpm-config-data';
import { Utility } from '../util/utils';
import type { CustomTomlTypes } from '../util/toml/toml-types';

export class ViewProvider {
  public initialized: boolean = false;

  public existWebView: boolean = false;

  protected disposable?: vscode.Disposable;

  // events
  protected settingsProviderActivated = new vscode.EventEmitter<void>();

  // configuration data
  protected cjpmContent: CustomTomlTypes;
  protected cjpmTomlPath: string = '/cjpm.toml';
  protected cjpmBuildArgs: CjpmBuildArgs;
  protected cjpmbuildPath: string = '/.vscode/cjpm_build_args.json';

  // webviewPanel objects
  protected panel?: vscode.WebviewPanel;
  protected disposablesPanel?: vscode.Disposable;
  protected context: vscode.ExtensionContext;
  protected viewType: string;
  protected title: string;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.disposable = vscode.Disposable.from(this.settingsProviderActivated);
  }

  public createOrShow(htmlPath: string, jsPath: string, cssPath: string, viewColumn?: vscode.ViewColumn): void {
    const column: vscode.ViewColumn | undefined = viewColumn ?? vscode.window.activeTextEditor?.viewColumn;

    // show existing panel
    if (Utility.checkIsValid(this.panel)) {
      this.panel.reveal(column, false);
      return;
    }

    this.initialized = false;

    // create new panel
    this.panel = vscode.window.createWebviewPanel(
      this.viewType,
      this.title,
      column ?? vscode.ViewColumn.One,
      {
        enableCommandUris: true,
        enableScripts: true,
      }
    );
    this.existWebView = true;

    this.disposablesPanel = vscode.Disposable.from(
      this.panel,
      this.panel.onDidDispose(this.onPanelDisposed, this),
      this.panel.webview.onDidReceiveMessage(this.onMessageReceived, this)
    );

    this.panel.webview.html = this.getHtml(htmlPath, jsPath, cssPath);
  }
     
  public dispose(): void {
    // clean up all resources
    if (Utility.checkIsValid(this.panel)) {
      this.panel.dispose();
    }

    if (Utility.checkIsValid(this.disposable)) {
      this.disposable.dispose();
    }

    if (Utility.checkIsValid(this.disposablesPanel)) {
      this.disposablesPanel.dispose();
    }
  }

  protected onPanelDisposed(): void {
    this.existWebView = false;
    if (Utility.checkIsValid(this.disposablesPanel)) {
      this.disposablesPanel.dispose();
      this.panel = undefined;
    }
  }

  protected onMessageReceived(message: unknown): void {
    if (!Utility.checkIsValid(message)) {
      return;
    }
  }

  protected getHtml(htmlPath: string, jsPath: string, cssPath: string): string {
    let content: string | undefined;

    content = fs.readFileSync(path.resolve(this.context.extensionPath, htmlPath)).toString();

    if (Utility.checkIsValid(this.panel?.webview)) {
      const settingsJsUri: vscode.Uri = this.panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(this.context.extensionPath, 'media', jsPath))
      );
      const settingsCssUri: vscode.Uri = this.panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(this.context.extensionPath, 'media', cssPath))
      );
      content = content.replace(/{{settings_js_uri}}/g, settingsJsUri.toString());
      content = content.replace(/{{settings_css_uri}}/g, settingsCssUri.toString());
    }

    content = content.replace(/{{nonce}}/g, this.getNonce());

    return content;
  }

  protected getNonce(): string {
    let nonce: string = '';
    const possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const securityCodeLength = 32;
    for (let i: number = 0; i < securityCodeLength; i++) {
      nonce += possible.charAt(Math.floor(crypto.randomBytes(1)[0] * possible.length));
    }
    return nonce;
  }
}