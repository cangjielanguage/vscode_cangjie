/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';

export const prefix = 'cangjie.debug.';

export const buildAndDebugCurrentFile = `${prefix}buildAndDebugCurrentFile`;

export const buildAndDebugCurrentFileByCjVM = `${prefix}buildAndDebugCurrentFileByCjVM`;

export const folderReverseBreakpoint = `${prefix}folderReverseBreakpoint`;

export const fileReverseBreakpoint = `${prefix}fileReverseBreakpoint`;

export const lineReverseBreakpoint = `${prefix}lineReverseBreakpoint`;

export const launchJsonCompletionFinishedCallback = `${prefix}launchJsonCompletionFinishedCallback`;

export const reverseDebugPrefix = 'cangjieReverseDebug.';

export const openReverseMode = `${reverseDebugPrefix}openReverseMode`;

export const closeReverseMode = `${reverseDebugPrefix}closeReverseMode`;

export const reverseStep = `${reverseDebugPrefix}reverseStep`;

export const stepInReverse = `${reverseDebugPrefix}stepInReverse`;

export const continueInReverse = `${reverseDebugPrefix}continueInReverse`;

export const unittestPrefix = 'cangjie.test.';

export const runUnitTest = `${unittestPrefix}run`;

export const debugUnitTest = `${unittestPrefix}debug`;

export const execTestCommand = `${unittestPrefix}execCommand`;

export const getTestFunctionsCommand = `${unittestPrefix}getTestFunctions`;

export const reverseContinue = `${reverseDebugPrefix}reverseContinue`;

export const tomlPrefix = 'cangjie.toml.';

export const tomlParser = `${tomlPrefix}parser`;

export const tomlStringify = `${tomlPrefix}stringify`;

export const debugCodeCommand = 'cangjie.debug';

export async function openFileInEditor(file: string): Promise<unknown> {
  return vscode.commands.executeCommand('vscode.open', file);
}

export async function closeActiveEditor(): Promise<unknown> {
  return vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}