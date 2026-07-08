/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {CompletionList, TextDocument, vscode, workspace, workspaceFolder} from '../src/__mocks__/vscode';
import {
  CangjieDebugConfigurationSnippetProvider,
  launchJsonCompletionFinishedCallback
} from '../src/cangjie-debug-configuration-snippet-provider';
import {cangjieConfig} from '../src/__mocks__/mockCommon';
import {CangjieDebugConfigAndPreTaskBuilder} from '../src/cangjie-debug-config-pretask-builder';

TextDocument.getText = jest.fn().mockReturnValue('{\n' +
  '    // Use IntelliSense to learn about possible attributes.\n' +
  '    // Hover to view descriptions of existing attributes.\n' +
  '    "version": "0.2.0",\n' +
  '    "configurations": [\n' +
  '        /*\n' +
  '         * this is config\n' +
  '         * debug main\n' +
  '         */\n' +
  '        {\n' +
  '            "name": "Cangjie (llvm): main.exe",\n' +
  '            "program": "main.exe",\n' +
  '            "request": "launch",\n' +
  '            "type": "cangjieDebug",\n' +
  '            "externalConsole": false,\n' +
  '            "env": {},\n' +
  '            "preLaunchTask": "cangjieDebug build task - P57sAVVCJ7"\n' +
  '        }\n' +
  '    ]\n' +
  '}');

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    existsSync: jest.fn().mockReturnValue(true),
  };
});

workspace.getWorkspaceFolder = jest.fn().mockReturnValue({
  uri: {
    scheme: 'file',
    authority: '',
    path: 'cangjieProject',
    query: '',
    fragment: '',
    _formatted: 'file:cangjieProject',
    _fsPath: 'cangjieProject',
  },
  name: 'cangjieProject',
  index: 0,
});

describe('test CangjieDebugConfigurationSnippetProvider', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  test('test provideCompletionItems', async () => {
    const snippetProvider = new CangjieDebugConfigurationSnippetProvider();
    const completionList = <CompletionList>await snippetProvider.provideCompletionItems(TextDocument, undefined,
      undefined, undefined);
    expect(completionList.items.length).toBeGreaterThanOrEqual(3);
  });

  test('test launchJsonCompletionFinishedCallback', async () => {
    vscode.window.showQuickPick = jest.fn().mockImplementationOnce((items: any[]) => {
      return items[1];
    }).mockImplementationOnce((items: any[]) => {
      return items[0];
    });
    vscode.window.showOpenDialog = jest.fn().mockReturnValue([{fsPath: 'main.cj'}]);
    await launchJsonCompletionFinishedCallback(cangjieConfig, workspaceFolder, new CangjieDebugConfigAndPreTaskBuilder());
    expect(vscode.workspace.saveAll).toBeCalledTimes(1);
  });
});