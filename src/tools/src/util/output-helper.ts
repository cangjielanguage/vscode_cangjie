/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type { OutputChannel } from 'vscode';
import {window} from 'vscode';
import { exec } from 'child_process';
import { Utility } from './utils';

export class OutputHelper {
  private static outputChannel: OutputChannel;

  static appendLine(content: string, showTime?: boolean): void {
    if (!Utility.checkIsValid(this.outputChannel)) {
      this.outputChannel = window.createOutputChannel('Cangjie Project Related Trace');
    }
    if (!showTime) {
      this.outputChannel.appendLine(`[Execute Time - ${new Date().toLocaleString()}]`);
    }
    this.outputChannel.show();
    this.outputChannel.appendLine(content);  
  }

  static execCommand(commandLine: string, execPath: string, envConfig: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(commandLine, { cwd: execPath, encoding: 'utf8', env: envConfig }, (err, stdout, stderr) => {
        if (Utility.checkIsValid(err)) {
          OutputHelper.appendLine(err?.stack, true);
          resolve(false);
        }
        if (Utility.checkIsValid(stderr) && Utility.checkIsValid(stdout)) {
          OutputHelper.appendLine(stderr, true);
          OutputHelper.appendLine(stdout);
          resolve(true);
        }
        if (Utility.checkIsValid(stderr) && Utility.checkIsValid(err)) {
          OutputHelper.appendLine(stderr, true);
          resolve(false);
        }
        if (!Utility.checkIsValid(stderr) && Utility.checkIsValid(stdout)) {
          OutputHelper.appendLine(stdout);
          resolve(true);
        }
      });
    });
  }
}
