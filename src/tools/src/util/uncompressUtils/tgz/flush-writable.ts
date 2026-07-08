/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import { Writable } from 'stream';
import { EventEmitter } from 'events';
import * as util from 'util';
import { Utility } from '../../utils';

export class FlushWritable extends Writable {
  constructor(opts: any) {
    super(opts);
    util.inherits(FlushWritable, Writable);
  }

  _flush(callback): void {}

  emit(evt: string, ...args: any[]): boolean {
    if (evt === 'finish') {
      this._flush((err: Error | null) => {
        if (Utility.checkIsValid(err)) {
          EventEmitter.prototype.emit.call(this, 'error', err);
        } else {
          EventEmitter.prototype.emit.call(this, 'finish');
        }
      });
    } else {
      return EventEmitter.prototype.emit.apply(this, [evt, ...args]);
    }
    return true;
  }
}