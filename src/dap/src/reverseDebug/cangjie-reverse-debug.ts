/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import * as utils from '../common-utils';
import {
  defaultStackTracePageSize,
  defaultVariablePageSize,
  enableReverseDebugSettingsName,
  reverseBreakpointLogMsg,
  reverseDebugConfigName,
  reverseDebugSettingsPrefix
} from '../constants';
import {ReverseDebugConfigProperty} from './reverse-debug-config-property';

export class CangjieReverseDebug {
  public static instance: CangjieReverseDebug;

  private _isCangjieReverseDebugMode: boolean;

  constructor() {
    this.isCangjieReverseDebugMode = false;
  }

  get isCangjieReverseDebugMode(): boolean {
    return this._isCangjieReverseDebugMode;
  }

  set isCangjieReverseDebugMode(isCangjieReverseDebugMode: boolean) {
    this._isCangjieReverseDebugMode = isCangjieReverseDebugMode;
  }

  static openReverseMode(): void {
    const args: UndoArguments = {
      undoEnable: true,
    };
    utils.sendRequest('undo', args);
  }

  static closeReverseMode(): void {
    const args: UndoArguments = {
      undoEnable: false,
    };
    utils.sendRequest('undo', args);
  }

  static stepInReverse(): void {
    let args: StepInReverseArguments = {
      threadId: 1,
    };
    utils.sendRequest('stepInReverse', args);
  }

  static reverseStep(): void {
    let args: ReverseStepArguments = {
      threadId: 1,
    };
    utils.sendRequest('reverseStep', args);
  }

  static continueInReverse(): void {
    let args: ContinueInReverseArguments = {
      threadId: 1,
    };
    utils.sendRequest('continueInReverse', args);
  }

  static reverseContinue(): void {
    let args: ReverseContinueArguments = {
      threadId: 1,
    };
    utils.sendRequest('reverseContinue', args);
  }

  static getReverseDebug(): CangjieReverseDebug {
    return vscode.debug.activeDebugSession.configuration[reverseDebugConfigName];
  }

  static supportReverseDebug(vmMode: boolean = false): boolean {
    return <boolean>vscode.workspace.getConfiguration(reverseDebugSettingsPrefix).get(enableReverseDebugSettingsName) &&
      !vmMode;
  }

  static getCacheDataConfig(): CacheDataConfigArguments {
    let config: ReverseDebugConfigProperty = ReverseDebugConfigProperty.instance;
    config.doRefreshConfig();
    let cacheDataConfigArguments: CacheDataConfigArguments = {
      startCacheData: this.supportReverseDebug(),
      saveHistoryCache: true,
      threadCount: config.cacheThreadNumber,
      stackFrameCount: config.cacheStackNumber,
      scopeType: config.cacheScopeType,
      variableChildrenLayers: config.cacheVariablesLayer,
      variableChildrenCount: config.cacheSubVariablesNumber,
      stackTracePageSize: defaultStackTracePageSize,
      variablePageSize: defaultVariablePageSize,
    };
    return cacheDataConfigArguments;
  }

  static addLineReverseBreakpoint(resource: vscode.Uri): void {
    if (!CangjieReverseDebug.supportSetReverseBreakpoint()) {
      return;
    }
    let location: vscode.Location = {
      uri: resource,
      range: new vscode.Range(vscode.window.activeTextEditor.selection.start.line, 0, vscode.window.activeTextEditor.selection.start.line, 0),
    };
    CangjieReverseDebug.addBreakpoints([location]);
  }

  static async addFileReverseBreakpoints(resource: vscode.Uri): Promise<void> {
    if (!CangjieReverseDebug.supportSetReverseBreakpoint()) {
      return;
    }
    await CangjieReverseDebug.queryAndAddBreakpoints([resource.fsPath]);
  }

  static async addFolderReverseBreakpoints(resource: vscode.Uri): Promise<void> {
    if (!CangjieReverseDebug.supportSetReverseBreakpoint()) {
      return;
    }
    let files: string[] = utils.searchCangjieSourceFile(resource.fsPath);
    if (files.length === 0) {
      vscode.window.showWarningMessage('No Cangjie source file in this folder !');
      return;
    }
    await CangjieReverseDebug.queryAndAddBreakpoints(files);
  }

  static supportSetReverseBreakpoint(): boolean {
    if (CangjieReverseDebug.instance?.isCangjieReverseDebugMode) {
      vscode.window.showWarningMessage('Reverse breakpoints cannot be set in reverse mode.');
      return false;
    }
    return true;
  }

  static async queryAndAddBreakpoints(files: string[]): Promise<void> {
    let uris: vscode.Uri[] = [];
    files.forEach(e => uris.push(vscode.Uri.file(e)));
    try {
      // execute lsp command
      await vscode.commands.executeCommand('cangjie.location.entryAndExit', uris).then((result) => {
        if (!result) {
          vscode.window.showWarningMessage('Query lsp failed !');
          return;
        }
        let locationArray = result as vscode.Location[];
        CangjieReverseDebug.addBreakpoints(locationArray);
      });
    } catch (e) {
      vscode.window.showWarningMessage(e.message);
    }
  }

  static addBreakpoints(locations: vscode.Location[]): void {
    let breakpointArray = new Array(locations.length);
    for (let i = 0; i < locations.length; i++) {
      breakpointArray[i] = new vscode.SourceBreakpoint(locations[i], true, undefined, undefined, reverseBreakpointLogMsg);
    }

    vscode.debug.addBreakpoints(breakpointArray);
  }
}

export interface UndoArguments {
  undoEnable: boolean;
}

export interface StepInReverseArguments {
  threadId: number;
}

export interface ReverseStepArguments {
  threadId: number;
}

export interface ContinueInReverseArguments {
  threadId: number;
}

export interface ReverseContinueArguments {
  threadId: number;
}

export interface CacheDataConfigArguments {
  startCacheData: boolean;
  saveHistoryCache: boolean;
  threadCount?: number;
  stackFrameCount?: number;
  variableChildrenCount?: number;
  variableChildrenLayers?: number;
  stackTracePageSize?: number;
  variablePageSize?: number;
  scopeType?: number;
}