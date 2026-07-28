/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {TestFuncOption} from './test-func-option';
import {TestType} from "./test-func-option";
import {checkIsValid, getCjpmFileType, getExecSuffix} from '../common-utils';
import * as path from 'path';
import * as vscode from 'vscode';
import {CjpmFileType} from '../types';
import {CommandResult, TerminalUtils} from '../TerminalUtils';

export abstract class UnittestExec {
  public abstract backendType: string;

  protected testFuncOption: TestFuncOption;

  protected testType: TestType;

  constructor(testFuncOption: TestFuncOption) {
    this.testFuncOption = testFuncOption;
    this.testType = checkIsValid(testFuncOption.functionName) ? TestType.FUNC : TestType.CLASS;
  }

  protected static async getDefaultUnittestRootPath(isDebug?: boolean): Promise<string> {
    const currentWorkspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    let aimFile = isDebug ? 'debug' : 'release';
    let projectManagerFileType = getCjpmFileType();
    switch (projectManagerFileType) {
      case CjpmFileType.TOML:
        return path.join(currentWorkspacePath, 'target', aimFile, 'unittest_bin');
      case CjpmFileType.JSON:
        return path.join(currentWorkspacePath, 'unittest', aimFile, 'bin');
      default:
        return '';
    }
  }

  protected static async execBuildCommand(command: string): Promise<CommandResult> {
    return vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      title: '[Unittest] Compiling...',
      cancellable: false,
    }, async (progress) => {
      progress.report({increment: 0});
      await vscode.workspace.saveAll(false);
      let commandResult: CommandResult;
      try {
        const executionResult = await TerminalUtils.executeCommand(
          command,
          vscode.workspace.workspaceFolders[0].uri.fsPath
        );
        progress.report({increment: 100, message: '[Unittest] Compilation complete！'});
        commandResult = executionResult;
      } catch (error) {
        progress.report({increment: 100, message: '[Unittest] Compilation failed！'});
        commandResult = {success: false};
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      return commandResult;
    });
  }

  protected async getDefaultProgram(testFuncOptions: TestFuncOption, isDebug?: boolean, utPath?: string): Promise<string> {
    let programName = `${testFuncOptions.packageName}${getExecSuffix(this.backendType === 'CJVM')}`;
    if (!checkIsValid(utPath)) {
      utPath = await UnittestExec.getDefaultUnittestRootPath(isDebug);
    }
    return path.join(utPath, programName);
  }

  public abstract run(): Promise<void>;

  public abstract debug(): Promise<void>;
}