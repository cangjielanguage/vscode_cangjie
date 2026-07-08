/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type CustomTomlDate from './custom-toml-date';
import type {ObjType} from './toml-enum';

export interface MetaState {
  objType: ObjType;
  undo: boolean;
  index: number;
  record: MetaRecord;
}

export interface MetaRecord {
  [k: string]: MetaState;
}

export type TableRecord = [string, Record<string, CustomTomlTypes>, MetaRecord] | null;

export type CustomTomlTypes =
  | string
  | number
  | boolean
  | CustomTomlDate
  | { [key: string]: CustomTomlTypes }
  | CustomTomlTypes[];