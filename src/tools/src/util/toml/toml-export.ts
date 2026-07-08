/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {CustomTomlTypes} from './toml-types';
import {type CommentRecord, parseToml} from './toml-parse';
import {stringifyToml} from './toml-stringify';

export class TOML {
  private codeDocMap = new Map<string, CommentRecord[]>();

  parse(content: string): Record<string, CustomTomlTypes> {
    return parseToml(content, this.codeDocMap);
  }

  stringify(obj: unknown): string {
    return stringifyToml(obj, this.codeDocMap);
  }
}

export function parse(content: string): Record<string, CustomTomlTypes> {
  return parseToml(content, new Map<string, CommentRecord[]>());
}

export function stringify(obj: unknown): string {
  return stringifyToml(obj, new Map<string, CommentRecord[]>());
}