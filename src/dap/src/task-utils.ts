/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {Task, TaskDefinition} from 'vscode';
import {ProcessExecution, TaskPanelKind, TaskRevealKind, TaskScope} from 'vscode';
import {debugType} from './constants';
import * as path from 'path';

export const cangjieBuildType = 'cangjieDebugBuild';

export interface BuildTaskDefinition extends TaskDefinition {
  label: string;
  cmd: string;
  args: string[];
}

export function resolveBuildTaskDefinition(def: BuildTaskDefinition): Task {
  return {
    definition: def,
    isBackground: false,
    name: `${debugType} - ${path.basename(def.cmd)}`,
    execution: new ProcessExecution(def.cmd, def.args),
    source: debugType,
    presentationOptions: {
      focus: true,
      reveal: TaskRevealKind.Always,
      clear: true,
      echo: true,
      panel: TaskPanelKind.Shared,
      showReuseMessage: false,
    },
    runOptions: {},
    //  should add problem matchers
    problemMatchers: [],
    scope: TaskScope.Workspace,
  };
}