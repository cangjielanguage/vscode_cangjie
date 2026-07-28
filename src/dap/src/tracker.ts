/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {DebugAdapterTracker, OutputChannel} from 'vscode';
import {spaceFillNum} from './constants';

export class Tracker implements DebugAdapterTracker {
  private out: OutputChannel;

  constructor(out: OutputChannel) {
    this.out = out;
  }

  onWillStartSession?(): void {
    this.out.appendLine('start session');
  }

  onWillReceiveMessage?(message: any): void {
    this.out.appendLine(
      `================== send message to server at ${new Date().toLocaleTimeString()} ======================`);
    this.out.appendLine(JSON.stringify(message, null, spaceFillNum));
  }

  onDidSendMessage?(message: any): void {
    this.out.appendLine(
      `================== receive message from server at ${new Date().toLocaleTimeString()} =================`);
    this.out.appendLine(JSON.stringify(message, null, spaceFillNum));
  }

  onWillStopSession?(): void {
    this.out.appendLine('stop session');
  }

  onError?(error: Error): void {
    this.out.appendLine(`================== error message at ${new Date().toLocaleTimeString()}  ==============`);
    this.out.appendLine(error.name);
    this.out.appendLine(error.message);
    if (error.stack) {
      this.out.append(error.stack);
    }
  }

  onExit?(code: number | undefined, signal: string | undefined): void {
    this.out.appendLine(`exit with code ${code} and with signal ${signal}`);
  }
}