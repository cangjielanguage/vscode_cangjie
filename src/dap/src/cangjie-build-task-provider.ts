/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {
  CancellationToken,
  ProviderResult,
  Task,
  TaskProvider
} from 'vscode';
import type {BuildTaskDefinition} from './task-utils';
import {resolveBuildTaskDefinition} from './task-utils';
import {checkIsValid, execNativeProcess, getOs} from './common-utils';
import * as vscode from 'vscode';

export class CangjieBuildTaskProvider implements TaskProvider {
  private static async resolveTaskAsync(task: Task): Promise<Task> {
    if (task.execution) {
      return undefined;
    }
    const def = <BuildTaskDefinition>task.definition;
    let cmd = def.cmd;
    if (getOs() === 'win' && checkIsValid(cmd) && cmd.endsWith('cmd.exe')) {
      cmd = def.args?.find(arg => arg.endsWith('cjc.exe'));
    }
    try {
      if (cmd !== undefined) {
        await execNativeProcess(cmd, ['-v']);
      }
    } catch (all) {
      vscode.window.showErrorMessage(`${cmd} doesn't exist or permission denied.`);
    }
    return resolveBuildTaskDefinition(def);
  }

  provideTasks(token?: CancellationToken): ProviderResult<Task[]> {
    return undefined;
  }

  resolveTask(task: Task, token?: CancellationToken): ProviderResult<Task> {
    return CangjieBuildTaskProvider.resolveTaskAsync(task);
  }
}