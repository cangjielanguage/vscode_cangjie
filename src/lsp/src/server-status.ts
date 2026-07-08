/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import { ChangjieContext } from './cangjie-context';
import { State } from './utils/constantNums';
import { Utility } from './utils/utils';

export function activate(context: ChangjieContext): void {
  context.subscriptions.push(vscode.commands.registerCommand('cangjie.openOutputPanel', () => context.client.outputChannel.show()));
  const status = new ServerStatus('cangjie.openOutputPanel');
  context.subscriptions.push(vscode.Disposable.from(status));
  context.subscriptions.push(
    vscode.commands.registerCommand('cangjie.lsp.updateState', (serverInfo: ServerInfo) => {
      status.updateServerState(serverInfo);
    }),
  );
}

export interface ServerInfo {
  state: State;
  serverVersion?: string;
  isSdkServer?: boolean;
}

class ServerStatus {
  private serverStatusBar: vscode.StatusBarItem;
  private stoppedToolTip: vscode.MarkdownString;
  private startingToolTip: vscode.MarkdownString;
  private runningToolTip: vscode.MarkdownString;

  constructor(command: string) {
    this.serverStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    this.serverStatusBar.command = command;
    this.initToolTip();
    this.serverStatusBar.tooltip = this.stoppedToolTip;
    this.serverStatusBar.text = '$(error) Cangjie';
    this.serverStatusBar.show();
  }

  initToolTip(): void {
    this.stoppedToolTip = new vscode.MarkdownString('', true);
    this.stoppedToolTip.isTrusted = true;
    this.stoppedToolTip.appendMarkdown('\n\n[Open Log](command:cangjie.openOutputPanel)');
    this.stoppedToolTip.appendMarkdown('\n\n[Launch Server](command:cangjie.lsp.reLaunch)');
    this.stoppedToolTip.appendMarkdown('\n\nServer State: [Stopped]');
    this.stoppedToolTip.appendMarkdown('\n\nServer Version: null(Extension)');

    this.startingToolTip = new vscode.MarkdownString('', true);
    this.startingToolTip.isTrusted = true;
    this.startingToolTip.appendMarkdown('\n\n[Open Log](command:cangjie.openOutputPanel)');
    this.startingToolTip.appendMarkdown('\n\nServer State: [Starting]');
    this.startingToolTip.appendMarkdown('\n\nServer Version: null(Extension)');

    this.runningToolTip = new vscode.MarkdownString('', true);
    this.runningToolTip.isTrusted = true;
    this.runningToolTip.appendMarkdown('\n\n[Open Log](command:cangjie.openOutputPanel)');
    this.runningToolTip.appendMarkdown('\n\n[Restart Server](command:cangjie.lsp.reLaunch)');
    this.runningToolTip.appendMarkdown('\n\n[Stop Server](command:cangjie.lsp.stop)');
    this.runningToolTip.appendMarkdown('\n\nServer State: [Running]');
    this.runningToolTip.appendMarkdown('\n\nServer Version: null(Extension)');
  }

  public updateServerState(serverInfo: ServerInfo): void {
    if (!(this.serverStatusBar.tooltip instanceof vscode.MarkdownString)) {
      return;
    }
    const state = serverInfo.state;
    switch (state) {
      case State.Stopped:
        this.serverStatusBar.text = '$(error) Cangjie';
        this.serverStatusBar.tooltip = this.stoppedToolTip;
        this.serverStatusBar.color = new vscode.ThemeColor('statusBarItem.errorForeground');
        this.serverStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        break;
      case State.Starting:
        this.serverStatusBar.text = '$(sync~spin) Cangjie';
        this.serverStatusBar.tooltip = this.startingToolTip;
        this.serverStatusBar.color = '#C0C0C0';
        this.serverStatusBar.backgroundColor = new vscode.ThemeColor('');
        break;
      case State.Running:
        this.serverStatusBar.text = 'Cangjie';
        this.serverStatusBar.tooltip = this.runningToolTip;
        this.serverStatusBar.color = '';
        this.serverStatusBar.backgroundColor = new vscode.ThemeColor('');
        break;
      default:
        break;
    }

    if (Utility.checkIsValid(serverInfo.serverVersion)) {
      const serverVersionReg = new RegExp('Server Version: (?<version>[^(]+)');
      const serverVersion = this.serverStatusBar.tooltip.value.match(serverVersionReg)[1];
      this.serverStatusBar.tooltip.value = this.serverStatusBar.tooltip.value.replace(serverVersion, serverInfo.serverVersion);
    }
    if (Utility.checkIsValid(serverInfo.isSdkServer)) {
      const isSdkServerReg = new RegExp('Server Version: (?<version>[^(]+)(?<isSdkServer>[^\r\n]+)');
      const isSdkServe = this.serverStatusBar.tooltip.value.match(isSdkServerReg)[2];
      this.serverStatusBar.tooltip.value = this.serverStatusBar.tooltip.value.replace(isSdkServe, '(Sdk)');
    }
  }

  dispose(): void {
    this.serverStatusBar.dispose();
  }
}