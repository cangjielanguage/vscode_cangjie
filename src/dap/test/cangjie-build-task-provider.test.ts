/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {CangjieBuildTaskProvider} from '../src/cangjie-build-task-provider';
import {TaskScope} from '../src/__mocks__/vscode';

describe('test CangjieBuildTaskProvider', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  test('test resolveTask', async () => {
    const taskProvider = new CangjieBuildTaskProvider();
    const task = {
      definition: {
        "type": "cangjieDebugBuild",
        "cmd": "cjc.exe",
        "args": [
          "-g",
          "main.cj",
          "-o",
          "main.exe"
        ],
        "label": "cangjieDebug build task - 5JhhvGAypg"
      },
      scope: TaskScope.Workspace,
      name: 'cangjieDebug build task - k05iE9La1T',
      isBackground: false,
      source: 'Workspace',
      presentationOptions: {},
      problemMatchers: [''],
      runOptions: {},
    };
    const result = await taskProvider.resolveTask(task);
    expect(result).toBeDefined();
    expect(result.name).toContain('cangjieDebug');
  });
});