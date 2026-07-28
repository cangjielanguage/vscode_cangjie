/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as stream from 'stream';

export class UncompressBaseStream extends stream.Writable {
  public emit(event: string, ...data: any): boolean {
    if (event === 'error') {
      const error = data;
      if ('name' in error && error.name === 'Error') {
        error.name = `${this.constructor.name}Error`;
      }
    }
    const argument = [event, ...data];
    return super.emit.apply(this, argument);
  }
}