/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {CancellationToken, WebviewView, WebviewViewProvider, WebviewViewResolveContext} from 'vscode';
import {TimelineWebView} from './timeline';

export class TimelineWebviewViewProvider implements WebviewViewProvider {
  resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext,
    token: CancellationToken): Thenable<void> | void {
    webviewView.webview.options = TimelineWebView.getWebviewOptions();
    let view = new TimelineWebView(webviewView.webview);
    webviewView.onDidDispose(_ => view.dispose());
    view.initHtml();
    return undefined;
  }
}