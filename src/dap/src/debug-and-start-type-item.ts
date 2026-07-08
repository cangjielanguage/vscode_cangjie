/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {QuickPickItem} from 'vscode';
import type {DebugMacro, DebuggerType, StartDebugType, CangjieBackendType} from './types';

export class DebugAndStartTypeItem implements QuickPickItem {
  label: string;
  typeTuple: [DebuggerType, StartDebugType, DebugMacro, CangjieBackendType];

  constructor(typeTuple: [DebuggerType, StartDebugType, DebugMacro, CangjieBackendType]) {
    this.typeTuple = typeTuple;
    let backendType: string = typeTuple[3];
    this.label = `Cangjie (${backendType}): ${typeTuple[1]}`;
  }
}