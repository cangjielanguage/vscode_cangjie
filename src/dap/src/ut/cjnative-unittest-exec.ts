/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {UnittestExec} from './unittest-exec';
import {TestType} from './test-func-option';
import {checkIsValid, getOs} from '../common-utils';
import {CommandUtil} from '../command/command-util';
import * as vscode from 'vscode';
import {execTestCommand} from '../command';
import type {CangjieDebugConfiguration} from '../cangjie-debug-configuration';
import {debugType} from '../constants';
import {addDataToVSCodeJsonFile, getVSCodeJsonFileDataArray, launchJsonType} from '../json-utils';
import {CangjieDependencyBuilder} from '../config/cangjie-dependency-builder';
import {TerminalUtils} from '../TerminalUtils';

export class CjnativeUnittestExec extends UnittestExec {
  public backendType: string = 'CJNative';

  static getWorkspaceFromFilePath(filePath: string): vscode.WorkspaceFolder | undefined {
    const allWorkspaceFolders = vscode.workspace.workspaceFolders;
    if (allWorkspaceFolders) {
      for (const workspaceFolder of allWorkspaceFolders) {
        if (filePath.startsWith(workspaceFolder.uri.toString())) {
          return workspaceFolder;
        }
      }
    }
    return undefined;
  }

  async run(): Promise<void> {
    let runArgs = CommandUtil.runUtArgs(this.testFuncOption, this.testType);
    await vscode.commands.executeCommand(execTestCommand, `cjpm test -i${runArgs}`);
  }

  async debug(): Promise<void> {
    const workspaceFolder =
      vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(this.testFuncOption.uri));
    let confNamePre = `${this.testFuncOption.packageName}.${this.testFuncOption.className}`;
    let confName =
      this.testType === TestType.CLASS ? confNamePre : `${confNamePre}.${this.testFuncOption.functionName}`;
    let command = CommandUtil.buildUtCommand(this.testFuncOption, this.testType, true);
    let commandResult = await UnittestExec.execBuildCommand(command);
    let programPath = TerminalUtils.parseCjpmTestCommandResult(commandResult);
    const debugConfig: CangjieDebugConfiguration = {
      name: `Cangjie (CJNative-unittest): ${confName}`,
      program: await this.getDefaultProgram(this.testFuncOption, true, programPath),
      request: 'launch',
      type: debugType,
      externalConsole: false,
      env: {},
    };
    let envStr = await new CangjieDependencyBuilder().isUnittest(true).builder();
    if (envStr !== '') {
      debugConfig.env[getOs() === 'win' ? 'Path' : getOs() === 'linux' ? 'LD_LIBRARY_PATH' : 'DYLD_LIBRARY_PATH'] =
        envStr;
    }
    let args = [];
    for (const runArg of CommandUtil.runUtArgs(this.testFuncOption, this.testType).split(' ')) {
      if (checkIsValid(runArg)) {
        args.push(runArg.trim());
      }
    }
    if (args.length > 0) {
      debugConfig.args = args;
    }
    let folder = CjnativeUnittestExec.getWorkspaceFromFilePath(this.testFuncOption.uri);
    const launchConfigurations = getVSCodeJsonFileDataArray(folder, launchJsonType);
    const filtered = launchConfigurations.filter(c => {
      const con = <CangjieDebugConfiguration>c;
      return con.name === debugConfig.name && con.program === debugConfig.program;
    });
    if (filtered.length > 0) {
      await vscode.debug.startDebugging(workspaceFolder, debugConfig);
      return;
    }
    await addDataToVSCodeJsonFile(folder, launchJsonType, [debugConfig]);
    await vscode.debug.startDebugging(workspaceFolder, debugConfig);
  }
}