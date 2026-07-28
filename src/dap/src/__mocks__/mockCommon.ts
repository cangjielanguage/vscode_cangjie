/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {vscode} from './vscode';
import * as dapInstall from '../install';
import {CangjieDebugConfiguration} from '../cangjie-debug-configuration';

export const cangjieConfig: CangjieDebugConfiguration = {
  'name': 'Cangjie (llvm): main.exe',
  'program': 'main.exe',
  'request': 'launch',
  'type': 'cangjieDebug',
  'externalConsole': false,
};

export async function mockActiveExtensions() {
  const outputChannel = vscode.window.createOutputChannel('Cangjie Debug');
  const context = vscode.ExtensionContext;
  context.subscriptions.push(outputChannel);
  await dapInstall.activate(context, outputChannel);
}