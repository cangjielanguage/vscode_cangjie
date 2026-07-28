/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';

import * as dapInstall from './src/install';


/**
 *  This method is called when the extension is activated. The extension is
 *  activated the very first time a command is executed.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const outputChannel =
    vscode.window.createOutputChannel('Cangjie Debug');
  context.subscriptions.push(outputChannel);
  await dapInstall.activate(context, outputChannel);
}