/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';

interface CustomBuildTaskDefinition extends vscode.TaskDefinition {
  cmd: string;
  group: string;
}

export class CustomBuildTaskProvider implements vscode.TaskProvider {
  static customBuildScriptType = 'buildcangjie';
  private tasks: vscode.Task[] | undefined;

  constructor() {
  }

  public async provideTasks(): Promise<vscode.Task[]> {
    return this.getTasks();
  }

  public resolveTask(_task: vscode.Task): vscode.Task | undefined {
    return undefined;
  }

  private getTasks(): vscode.Task[] {
    if (this.tasks !== undefined) {
      return this.tasks;
    }

    this.tasks = [this.getTask('')];
    return this.tasks;
  }

  private getTask(flavor: string, definition?: CustomBuildTaskDefinition): vscode.Task {
    let curDefinition = definition;
    if (curDefinition === undefined) {
      curDefinition = {
        type: CustomBuildTaskProvider.customBuildScriptType,
        group: 'build',
        cmd: 'cjpm build -g',
      };
    }
    let task: vscode.Task = new vscode.Task(curDefinition, vscode.TaskScope.Workspace,
      'cangjie', 'build', new vscode.ShellExecution('cjpm', ['build', '-g']));
    task.group = vscode.TaskGroup.Build;
    return task;
  }
}