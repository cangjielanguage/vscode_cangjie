/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as path from 'path';
import {
  getExecSuffix,
  getOs,
  isCjSourceFile
} from './common-utils';
import type {Uri} from 'vscode';
import * as vscode from 'vscode';
import type {CangjieDebugConfiguration} from './cangjie-debug-configuration';
import {CangjieDebugConfigAndPreTaskBuilder} from './cangjie-debug-config-pretask-builder';
import {
  addDataToVSCodeJsonFile,
  getVSCodeJsonFileDataArray,
  launchJsonType,
  tasksJsonType
} from './json-utils';
import {debugType} from './constants';

export function getTargetFilePathFromSourcePath(sourceFilePath: string, vmMode: boolean = false): string | undefined {
  if (!sourceFilePath) {
    return undefined;
  }
  let sourceBaseName = path.basename(sourceFilePath);
  const sourceFolder = sourceFilePath.substring(0, sourceFilePath.length - sourceBaseName.length);
  if (sourceBaseName.indexOf('.') >= 0) {
    sourceBaseName = sourceBaseName.substring(0, sourceBaseName.lastIndexOf('.'));
  }
  const name = sourceBaseName + getExecSuffix(vmMode);
  return path.join(sourceFolder, name);
}

export function createSingleFileBuildCommand(compilerPath: string, sourceFilePath: string,
  vmMode: boolean = false): string[] {
  const targetFilePath = getTargetFilePathFromSourcePath(sourceFilePath, vmMode);
  const commandPrefix = getOs() === 'win' ? ['C:/Windows/System32/cmd.exe', '/C', 'chcp', '65001', '&&'] : [];
  return [...commandPrefix, compilerPath, '-g', sourceFilePath, '-o', targetFilePath];
}

/**
 * if uri is null, try build and run active file in editor
 */
export async function buildAndDebugSingleFile(uriParam: Uri, vmMode: boolean = false): Promise<void> {
  let uri: Uri = uriParam;
  if (!uri) {
    uri = vscode.window.activeTextEditor?.document.uri;
  }
  if (!uri) {
    vscode.window.showErrorMessage('no opened file in editor');
    return;
  }
  if (!isCjSourceFile(uri.fsPath)) {
    throw new Error('source file is not Cangjie');
  }
  // try run existing debug config first
  const folder = vscode.workspace.getWorkspaceFolder(uri);
  const launchConfigurations = getVSCodeJsonFileDataArray(folder, launchJsonType);
  const filtered = launchConfigurations.filter(c => {
    const con = <CangjieDebugConfiguration>c;
    return con.preLaunchTask &&
      con.type === debugType &&
      con.program === getTargetFilePathFromSourcePath(uri.fsPath, vmMode);
  });
  if (filtered.length > 0) {
    await vscode.debug.startDebugging(folder, filtered[0]);
    return;
  }
  const builder = new CangjieDebugConfigAndPreTaskBuilder();
  builder.workspaceFolder = folder;
  builder.debuggerType = 'cjdb';
  builder.startDebugType = 'launch';
  if (vmMode === true) {
    builder.cangjieBackendType = 'CJVM';
    builder.buildType = 'singleFile(CJVM)';
  } else {
    builder.cangjieBackendType = 'CJNative';
    builder.buildType = 'singleFile';
  }
  builder.sourceFilePath = uri.fsPath;
  const config = builder.buildConfig();
  const tasks = builder.buildPreTask();
  await addDataToVSCodeJsonFile(folder, tasksJsonType, tasks);
  await addDataToVSCodeJsonFile(folder, launchJsonType, [config]);
  await vscode.debug.startDebugging(folder, config);
}

export async function buildAndDebugSingleFileByCjVM(uri: Uri): Promise<void> {
  if (getOs() !== 'linux') {
    vscode.window.showErrorMessage('CJVM backend only support linux');
    return;
  }
  await buildAndDebugSingleFile(uri, true);
}