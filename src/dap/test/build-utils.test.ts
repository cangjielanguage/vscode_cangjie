/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {vscode} from '../src/__mocks__/vscode';
import {buildAndDebugSingleFile} from '../src/build-utils';

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    existsSync: jest.fn().mockReturnValue(true),
  };
});

describe('test buildUtils', () => {
  test('test buildAndDebugSingleFile', async () => {
    vscode.Uri.fsPath = 'main.cj';
    await buildAndDebugSingleFile(vscode.Uri);
    expect(vscode.debug.startDebugging).toHaveBeenCalled();
  });
});