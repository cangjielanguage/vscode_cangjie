/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import { Utility } from '../util/utils';
import * as path from 'path';

export class UpdateSdk {
  /**
   * listen Sdk Path change
   * @param event vscode.ConfigurationChangeEvent
   */
  public static async listenSdkPath(event: vscode.ConfigurationChangeEvent): Promise<void> {
    let pathSdk = Utility.getCangjieHome();
    vscode.workspace.getConfiguration();
    let updateFlag: boolean;
    if (Utility.getSdkOption() === 'CJNative') {
      updateFlag = event.affectsConfiguration('CangjieSdkPath.CJNativeBackend');
    } else {
      updateFlag = event.affectsConfiguration('CangjieSdkPath.CJVMBackend');
    }

    if (!updateFlag) {
      return;
    }
    // config CANGJIE_HOME env
    const lspState: boolean = await vscode.commands.executeCommand('cangjie.lsp.state');
    if (lspState) {
      if (fs.existsSync(pathSdk) && UpdateSdk.envsetupFileIsExist(pathSdk)) {
        Utility.removeSdkAttributes();
        Utility.configTerminalcjpmEnv();
        vscode.window.showInformationMessage('Set SDK path success');
        const quickPickOptions: vscode.QuickPickOptions = {
          title: 'sdkPath is modified!',
          placeHolder: 'The sdk path has been modified, do you want to restart the LSPServer to active modifications?',
        };
        const select = await vscode.window.showQuickPick(['Yes', 'No'], quickPickOptions);
        if (select === 'Yes') {
          vscode.commands.executeCommand('cangjie.lsp.reLaunch');
        }
      } else {
        vscode.window.showErrorMessage('SDK path is not exists');
      }
    }
  }

  /**
   * listen Sdk Option change
   * @param event vscode.ConfigurationChangeEvent
   */
  public static async listenSdkOption(event: vscode.ConfigurationChangeEvent): Promise<void> {
    let optionChanged = event.affectsConfiguration('CangjieSdk.Option');
    if (optionChanged) {
      const backend = Utility.getSdkOption();
      Utility.removeSdkAttributes();
      vscode.window.showInformationMessage(`You have changed to ${backend}-backend compiler.`);
      Utility.configTerminalcjpmEnv();
    }
  }

  /**
   * check whether the envsetup.sh file is contained in the Cangjie SDK path
   * @param filePath cangjie SDKpath
   * @returns
   */
  public static envsetupFileIsExist(filePath: string): boolean {
    let flag: boolean = false;
    const files = fs.readdirSync(filePath);
    // read files through the current directory
    files.forEach((fileName: string) => {
      if (fileName === 'envsetup.sh') {
        flag = true;
        return;
      }
    });
    return flag;
  }
}