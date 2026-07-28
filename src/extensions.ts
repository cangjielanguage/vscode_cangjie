/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import * as launchServer from './lsp/src/extension';
import * as toolsInstall from './tools/src/launch-tools';
import * as launchDap from './dap/launch-dap';
import * as toolsUtility from './tools/src/util/utils';
import * as path from 'path';
import * as fs from 'fs';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  toolsUtility.Utility.serverRun = true;
  // open readme after install cangjie plugin
  await openReadme(context);
  // register toml util
  toolsInstall.registerTomlUtil();
  toolsInstall.activate(context);
  launchDap.activate(context);
  launchServer.activate(context);
  toolsInstall.registerFileWatcher(context);
}

async function openReadme(context: vscode.ExtensionContext): Promise<void> {
  const readmePath = path.join(context.extensionPath, 'resources', 'README.md');
  const readmeUri = vscode.Uri.file(readmePath);
  const document = await vscode.workspace.openTextDocument(readmeUri);
  let disposable = vscode.commands.registerCommand('cangjie.openReadme', async () => {
    try {
      await vscode.commands.executeCommand('markdown.showPreview', document.uri);  
    } catch (err) {
      vscode.window.showErrorMessage('Can not open Cangjie README.md.');
    }
  });
  context.subscriptions.push(disposable);

  const flagFile = path.join(context.extensionPath, 'cangjie-plugin-readme-flag.txt');
  if (fs.existsSync(flagFile)) {
    return;
  }
  fs.writeFileSync(flagFile, '', {flag: 'wx'});
  try {
    await vscode.commands.executeCommand('markdown.showPreview', document.uri);
  } catch (err) {
    vscode.window.showErrorMessage('Can not open Cangjie README.md.');
  }
}