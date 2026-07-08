/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import { window } from 'vscode';
import type { Terminal, ExtensionContext } from 'vscode';
import { Utility } from './utils';
import {cjpmBuildArgExtname, delay10, delay100, CJPM_TOML} from './constant-num';
import * as path from 'path';
import { Worker } from 'worker_threads';

export class TerminalHelper {
  private static context: ExtensionContext;
  
  private static cangjieTerminal: Terminal;

  static async execCommand(cmd: string): Promise<void> {
    this.clearCjPanels();
    let osSystem = Utility.getOsSystem();
    const customizedTerminal = vscode.workspace.getConfiguration('terminal.integrated.defaultProfile').get(osSystem);
    if (Utility.checkIsValid(customizedTerminal)) {
      this.cangjieTerminal = window.createTerminal({
        name: 'cangjie',
        cwd: Utility.getCjRootProjectPath(),
      });
    } else {
      // default terminal path
      let shellPath = '/bin/bash';
      let shellArgs = [];
      if (process.platform === 'win32') {
        shellPath = 'C:\\Windows\\System32\\cmd.exe';
        shellArgs = ['/K', 'chcp 65001'];
      }
      this.cangjieTerminal = window.createTerminal({
        name: 'cangjie',
        shellPath,
        shellArgs,
        cwd: Utility.getCjRootProjectPath(),
      });
      if (process.platform === 'linux' || process.platform === 'darwin') {
        // support Suse
        let setEnv = `source ${path.join(Utility.getCangjieHome(), 'envsetup.sh')}`;
        this.cangjieTerminal.sendText(setEnv);
        this.cangjieTerminal.sendText('clear');
      } else if (process.platform === 'win32') {
        let setEnv = `${path.join(Utility.getCangjieHome(), 'envsetup.bat')}`;
        this.cangjieTerminal.sendText(setEnv);
        this.cangjieTerminal.sendText('cls');
      } else {
        return;
      }
    }

    this.cangjieTerminal.sendText(cmd);
    // keep focus
    this.cangjieTerminal.show(false);

    if (cmd.includes('--lint')) {
      vscode.commands.executeCommand('cangjie.cjlint', undefined, true);
    }
  
    let id: number = await this.cangjieTerminal.processId;
    if (typeof id !== 'number') {
      return;
    }
    await this.sleep(delay100);
    const workerPath = path.join(__dirname, 'worker.js');
    const worker = new Worker(workerPath, {workerData: id});
    worker.on('message', (data) => {
      if (typeof data === 'boolean' && data) {
        if (Utility.serverRun && Utility.checkMacroLib()) {
          vscode.commands.executeCommand('cangjie.lsp.reLaunch');
        }
      }
    });
  }

  static setContext(context: ExtensionContext): void {
    this.context = context;
  }

  private static clearCjPanels(): void {
    const terminals = <Terminal[]>(window).terminals;
    for (let tml of terminals) {
      if (tml.name === 'cangjie') {
        tml.dispose();
      }
    }
  }

  private static getBinaryName(cmd: string): string {
    if (cmd.includes('-o')) {
      let cmdArr = cmd.split(' ');
      let argIndex = cmdArr.indexOf('-o');
      // alia name after -o arg
      if (Utility.getSdkOption() === 'CJNative') {
        return cmdArr[argIndex + 1];
      }
      return `${cmdArr[argIndex + 1]}.cbc`;
    }
    let buildArgsContent = Utility.getCjpmBuildArgsContent(cjpmBuildArgExtname);
    // whether set by user
    if (Utility.getSdkOption() === 'CJNative') {
      return buildArgsContent.alias === '' ? 'main' : buildArgsContent.alias;
    }
    return buildArgsContent.alias === '' ? 'main.cbc' : `${buildArgsContent.alias}.cbc`;
  }

  private static async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => { setTimeout(resolve, ms); });
    return;
  }
}