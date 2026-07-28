/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {DebugConfiguration} from 'vscode';
import type {CangjieBackendType, DebuggerType, StartDebugType} from './types';
import type {DebugMacro} from './types';

export interface CangjieDebugConfiguration extends DebugConfiguration {
  request: StartDebugType;
  program: string;
  processId?: string;
  externalConsole?: boolean;
  preLaunchTask?: string;
  remote?: boolean;
  remoteAddress?: string;
  remotePlatform?: string;
  remoteFilePath?: string;
  remoteCangjieSdkPath?: string;
  scriptCommands?: string[];
  buildBeforeLaunch?: boolean;
  debugMacro?:boolean;
  stopAtEntry?:boolean;
  vmMode?: boolean;
  vmAddress?: string;
  vmPort?: number;
  env?: any;
  javaRootPath?: any;
  args?: any;
  vmParam?: string[];
}

export const debuggerAndStartTypeArr: Array<[DebuggerType, StartDebugType, DebugMacro, CangjieBackendType]> = [
  ['cjdb', 'launch', '', 'CJNative'],
  ['cjdb', 'launch', 'debugMacro', 'CJNative'],
  ['cjdb', 'attach', '', 'CJNative'],
  ['cjdb', 'launch', '', 'CJVM'],
];