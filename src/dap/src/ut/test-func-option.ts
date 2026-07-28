/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {Range} from 'vscode';

export interface TestFuncOption {
  readonly packageName: string;
  readonly className: string;
  readonly functionName?: string;
  readonly filePath?: string;
  range: Range;
  uri: string;
}

export enum TestType {
  PACKAGE = 0,
  FILE = 1,
  CLASS = 2,
  FUNC = 3
}