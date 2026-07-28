/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import type {
  CancellationToken,
  CompletionContext,
  CompletionList, OpenDialogOptions,
  Position,
  ProviderResult,
  TextDocument
} from 'vscode';
import {CompletionItem} from 'vscode';
import {
  getIncrementalName, isBuildCommandAvailable,
  isCangjieProject
} from './common-utils';
import * as vSCodeCommands from './command';
import type {CangjieDebugConfiguration} from './cangjie-debug-configuration';
import {debuggerAndStartTypeArr} from './cangjie-debug-configuration';
import type {BuildType} from './types';
import {BuildTypeItem} from './build-type-item';
import {CangjieDebugConfigAndPreTaskBuilder} from './cangjie-debug-config-pretask-builder';
import {
  addDataToVSCodeJsonFile,
  launchJsonType,
  substituteDataInVSCodeJsonFile,
  tasksJsonType
} from './json-utils';
import {JsonCommentsHandler} from './json-comments-handler';
import {spaceFillNum} from './constants';

export class CangjieDebugConfigurationSnippetProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken,
    context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList> {
    const jsonCommentsHandle = new JsonCommentsHandler(document.getText());
    const launchStr: string = jsonCommentsHandle.stripJsonComments();
    const launch: any = JSON.parse(launchStr);
    let items: vscode.CompletionItem[] = [];
    const isCangjie = isCangjieProject() && isBuildCommandAvailable();
    for (const type of debuggerAndStartTypeArr) {
      const [debuggerType, startType, debugMacro, cangjieBackendType] = type;
      const isDebugMacro = debugMacro === 'debugMacro';
      if (!isCangjie && isDebugMacro) {
        continue;
      }
      const folder = vscode.workspace.getWorkspaceFolder(document.uri);
      const builder = new CangjieDebugConfigAndPreTaskBuilder();
      builder.workspaceFolder = folder;
      builder.debuggerType = debuggerType;
      builder.startDebugType = startType;
      builder.debugMacro = debugMacro;
      builder.cangjieBackendType = cangjieBackendType;
      builder.buildType = isDebugMacro ? 'cangjieProject' : 'chooseFile';
      const config = builder.buildConfig();
      const item = new CompletionItem(config.name);
      config.name = getIncrementalName(config.name, launch.configurations.map((c: any) => c.name));
      item.insertText = JSON.stringify(config, null, spaceFillNum);
      item.command = {
        title: 'Update Path',
        command: vSCodeCommands.launchJsonCompletionFinishedCallback,
        arguments: [config, folder, builder],
      };
      items.push(item);
    }
    if (launch.configurations.length !== 0) {
      items.forEach(item => item.insertText = `${item.insertText},`);
    }
    return new vscode.CompletionList(items, true);
  }

  resolveCompletionItem(item: CompletionItem, token: CancellationToken): ProviderResult<CompletionItem> {
    return item;
  }
}

export async function launchJsonCompletionFinishedCallback(old: CangjieDebugConfiguration,
  workspaceFolder: vscode.WorkspaceFolder, builder: CangjieDebugConfigAndPreTaskBuilder): Promise<void> {
  let buildTypes = getBuildTypes(builder);
  let selectedType: BuildType;
  if (builder.debugMacro === 'debugMacro') {
    selectedType = 'cangjieProject';
  } else {
    if (buildTypes.length > 1) {
      selectedType = (await vscode.window.showQuickPick(buildTypes.map(t => new BuildTypeItem(t))))?.buildType;
    }
  }
  if (!selectedType) {
    selectedType = 'chooseFile';
  }
  builder.buildType = selectedType;
  switch (selectedType) {
    case 'singleFile':
    case 'singleFile(CJVM)': {
      const options: OpenDialogOptions = {
        canSelectMany: false,
        canSelectFolders: false,
        canSelectFiles: true,
        defaultUri: workspaceFolder.uri,
        filters: {
          //  add more valid file types?
          'Cangjie Source File': ['cj'],
        },
      };
      const files = await vscode.window.showOpenDialog(options);
      if (!files || files.length === 0) {
        throw new Error('Cangjie source file not selected');
      }
      builder.sourceFilePath = files[0].fsPath;
      break;
    }
    case 'cangjieProject':
      break;
    case 'chooseFile':
      break;
    default:
      break;
  }
  const tasks = builder.buildPreTask();
  const config = builder.buildConfig();
  await vscode.workspace.saveAll(false);
  await addDataToVSCodeJsonFile(workspaceFolder, tasksJsonType, tasks);
  await substituteDataInVSCodeJsonFile(workspaceFolder, launchJsonType, old, config);
}

function getBuildTypes(builder: CangjieDebugConfigAndPreTaskBuilder): BuildType[] {
  let buildTypes: BuildType[] = ['chooseFile'];
  if (builder.cangjieBackendType === 'CJVM') {
    buildTypes.unshift('singleFile(CJVM)');
  } else {
    buildTypes.unshift('singleFile');
  }
  if (isCangjieProject()) {
    buildTypes.unshift('cangjieProject');
  }
  if (builder.startDebugType === 'attach') {
    buildTypes = ['chooseFile'];
  }
  return buildTypes;
}