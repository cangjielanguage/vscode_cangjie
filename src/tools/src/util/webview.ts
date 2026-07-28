/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import { Utility } from './utils';

export abstract class Webview {
  panel: vscode.WebviewPanel = null;

  newPanel(viewType: string, title: string): void {
    if (Utility.checkIsValid(this.panel) && viewType !== 'cjcovhtml') {
      this.panel.reveal(vscode.ViewColumn.Beside, true);
      return;
    }
    this.panel = vscode.window.createWebviewPanel(viewType, title, {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: true,
    }, {
      enableScripts: true,
      retainContextWhenHidden: true,
    });
    this.panel.onDidDispose(() => {
      this.panel = null;
    });
  }

  closePanel(): void {
    if (Utility.checkIsValid(this.panel)) {
      this.panel.dispose();
      this.panel = null;
    }
  }
}