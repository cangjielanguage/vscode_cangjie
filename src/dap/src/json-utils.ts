/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {CangjieDebugConfiguration} from './cangjie-debug-configuration';
import * as vscode from 'vscode';
import type {WorkspaceFolder} from 'vscode';
import * as path from 'path';
import * as vSCodeCommands from './command';
import * as fs from 'fs';

interface VSCodeJsonType {
  fileName: string;
  jsonArrField: string;
  version: string;
}

export const launchJsonType: VSCodeJsonType = {
  fileName: 'launch',
  jsonArrField: 'configurations',
  version: '0.2.0',
};

export const tasksJsonType: VSCodeJsonType = {
  fileName: 'tasks',
  jsonArrField: 'tasks',
  version: '2.0.0',
};

export async function getOrCreateVSCodeJsonFile(folder: WorkspaceFolder,
  vscodeJsonType: VSCodeJsonType): Promise<string> {
  let jsonArray = getVSCodeJsonFileDataArray(folder, vscodeJsonType);
  if (jsonArray.length === 0) {
    await writeVSCodeJsonTemplateToFile(folder, vscodeJsonType);
  }
  const file = path.join(folder.uri.fsPath, '.vscode', `${vscodeJsonType.fileName}.json`);
  if (!fs.existsSync(file)) {
    const error = `ERROR: Failed to create the ${vscodeJsonType.fileName}.json file.`;
    vscode.window.showErrorMessage(error);
    throw error;
  }
  return file;
}

export async function writeVSCodeJsonTemplateToFile(folder: WorkspaceFolder, vscodeJsonType: VSCodeJsonType)
  : Promise<void> {
  const jsonFile: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(vscodeJsonType.fileName, folder);
  await jsonFile.update('version', vscodeJsonType.version, vscode.ConfigurationTarget.WorkspaceFolder);
  await jsonFile.update(vscodeJsonType.jsonArrField, [], vscode.ConfigurationTarget.WorkspaceFolder);
}

export async function openFileInEditorWhenNeeded(file: string): Promise<void> {
  let editor = vscode.window.activeTextEditor;
  if (!editor || !editor.document || editor.document.fileName !== file) {
    await vSCodeCommands.openFileInEditor(file);
  }
  if (!editor || !editor.document || editor.document.fileName !== file) {
    throw new Error(`open file ${file} failed`);
  }
}

export function getVSCodeJsonFileDataArray(folder: WorkspaceFolder, vscodeJsonType: VSCodeJsonType): any[] {
  const jsonFile: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(vscodeJsonType.fileName, folder);
  let jsonArray = jsonFile.get(vscodeJsonType.jsonArrField) as any[];
  if (!jsonArray) {
    jsonArray = [];
  }
  return jsonArray;
}

export async function addDataToVSCodeJsonFile(folder: WorkspaceFolder, vscodeJsonType: VSCodeJsonType, data: any[])
  : Promise<void> {
  if (!data) {
    return;
  }
  const jsonFile: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(vscodeJsonType.fileName, folder);
  let jsonArray = getVSCodeJsonFileDataArray(folder, vscodeJsonType);
  if (jsonArray.length === 0) {
    await jsonFile.update('version', vscodeJsonType.version, vscode.ConfigurationTarget.WorkspaceFolder);
  }
  jsonArray = jsonArray.concat(data);
  await jsonFile.update(vscodeJsonType.jsonArrField, jsonArray, vscode.ConfigurationTarget.WorkspaceFolder);
}

export async function substituteDataInVSCodeJsonFile(folder: WorkspaceFolder, vscodeJsonType: VSCodeJsonType,
  oldData: any, newData: any): Promise<void> {
  if (!oldData || !newData) {
    return;
  }
  let jsonArray = getVSCodeJsonFileDataArray(folder, vscodeJsonType);
  for (let idx = 0; idx < jsonArray.length; idx++) {
    if ({}.hasOwnProperty.call(jsonArray, idx)) {
      const d = jsonArray[idx];
      if (JSON.stringify(d) === JSON.stringify(oldData)) {
        jsonArray[idx] = newData;
        break;
      }
    }
  }
  const jsonFile: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(vscodeJsonType.fileName, folder);
  await jsonFile.update(vscodeJsonType.jsonArrField, jsonArray, vscode.ConfigurationTarget.WorkspaceFolder);
}

//  re-write this function to support both launch.json and tasks.json
export async function updatePlaceholderInLaunchJson(fieldName: string, placeholder: string, replacement: string,
  target: CangjieDebugConfiguration, workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
  let jsonArray = getVSCodeJsonFileDataArray(workspaceFolder, launchJsonType);
  const filtered = jsonArray.filter(c => {
    const con = <CangjieDebugConfiguration>c;
    return con.type === target.type &&
      con.name === target.name &&
      con.request === target.request &&
      con[fieldName] === placeholder;
  });
  if (filtered.length > 0) {
    for (const oldData of filtered) {
      const newData = JSON.parse(JSON.stringify(oldData));
      newData[fieldName] = replacement;
      await substituteDataInVSCodeJsonFile(workspaceFolder, launchJsonType, oldData, newData);
    }
  }
}

export async function updateFieldInLaunchJson(fieldName: string, replacement: string,
  target: CangjieDebugConfiguration, workspaceFolder: vscode.WorkspaceFolder,
  isDataNeedUpdate: (src: CangjieDebugConfiguration, dest: CangjieDebugConfiguration) => boolean): Promise<void> {
  let jsonArray = getVSCodeJsonFileDataArray(workspaceFolder, launchJsonType);
  let isFileNeedUpdate = false;
  for (let i = 0; i < jsonArray.length; i++) {
    if (isDataNeedUpdate(jsonArray[i], target)) {
      jsonArray[i][fieldName] = replacement;
      isFileNeedUpdate = true;
    }
  }
  if (isFileNeedUpdate) {
    const jsonFile: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(launchJsonType.fileName,
      workspaceFolder);
    await jsonFile.update(launchJsonType.jsonArrField, jsonArray, vscode.ConfigurationTarget.WorkspaceFolder);
  }
}