/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {CangjieDebugConfigurationProvider} from '../src/cangjie-debug-configuration-provider';
import {vscode} from '../src/__mocks__/vscode';
import {mockActiveExtensions} from '../src/__mocks__/mockCommon';

describe('test CangjieDebugConfigurationProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('test provideDebugConfigurations', async () => {
    const cangjieDebugConfigurationProvider = new CangjieDebugConfigurationProvider();
    const configurations = await cangjieDebugConfigurationProvider.provideDebugConfigurations(vscode.WorkspaceFolder);
    expect(configurations).toBeDefined();
    expect(configurations[0].program).toContain('${programPath}');
  });

  test('test resolveDebugConfiguration', async () => {
    await mockActiveExtensions();
    const cangjieDebugConfigurationProvider = new CangjieDebugConfigurationProvider();
    const configurations = await cangjieDebugConfigurationProvider.resolveDebugConfiguration(vscode.WorkspaceFolder,
      undefined);
    expect(configurations).toBeDefined();
    expect(configurations.type).toContain('cangjieDebug');
  }, 10000);
});