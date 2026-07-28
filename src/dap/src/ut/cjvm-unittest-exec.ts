/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {TestType} from './test-func-option';
import {UnittestExec} from './unittest-exec';
import {checkIsValid, findAPortNotInUse} from '../common-utils';
import {CommandUtil} from '../command/command-util';
import * as vscode from 'vscode';
import {execTestCommand} from '../command';
import type {CangjieDebugConfiguration} from '../cangjie-debug-configuration';
import {cjvmPortLowerBound, debugType, portHigherBound} from '../constants';
import {TerminalUtils} from "../TerminalUtils";

export class CjvmUnittestExec extends UnittestExec {
  public backendType: string = 'CJVM';

  async run(): Promise<void> {
    let runArgs = CommandUtil.runUtArgs(this.testFuncOption, this.testType);
    await vscode.commands.executeCommand(execTestCommand, `cjpm test -i${runArgs}`);
  }

  async debug(): Promise<void> {
    const workspaceFolder =
      vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(this.testFuncOption.uri));
    let confName = this.testType === TestType.CLASS ? this.testFuncOption.className :
      `${this.testFuncOption.className}.${this.testFuncOption.functionName}`;
    const port = await findAPortNotInUse(cjvmPortLowerBound, portHigherBound);
    let command = CommandUtil.buildUtCommand(this.testFuncOption, this.testType, true);
    let commandResult = await UnittestExec.execBuildCommand(command);
    let programPath = TerminalUtils.parseCjpmTestCommandResult(commandResult);
    const debugConfig: CangjieDebugConfiguration = {
      name: `Cangjie (CJVM-unittest): ${confName}`,
      program: await this.getDefaultProgram(this.testFuncOption, true, programPath),
      request: 'launch',
      type: debugType,
      externalConsole: false,
      vmMode: true,
      vmPort: port,
    };
    let vmParam = [];
    for (const runArg of CommandUtil.runUtArgs(this.testFuncOption, this.testType).split(' ')) {
      if (checkIsValid(runArg)) {
        vmParam.push(runArg.trim());
      }
    }
    if (vmParam.length > 0) {
      debugConfig.vmParam = vmParam;
    }
    await vscode.debug.startDebugging(workspaceFolder, debugConfig);
  }
}