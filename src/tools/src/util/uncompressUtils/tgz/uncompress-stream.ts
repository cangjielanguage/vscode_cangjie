/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import { FlushWritable } from './flush-writable';
import * as uncompressUtil from '../uncompress-util';
import * as fs from 'fs';
import * as zlib from 'zlib';
import * as tar from 'tar-stream';

export class TgzUncompressStream extends FlushWritable {
  private _gzipStream;

  constructor(opts, token) {
    const curOpts = opts || {};
    super(curOpts);
    const newOpts: any = uncompressUtil.clone(curOpts);
    newOpts.source = undefined;
    this._gzipStream = zlib.createUnzip().on('error', err => this.emit('error', err));

    const tarStream = tar.extract().
      on('finish', () => this.ready(true)).
      on('entry', this.emit.bind(this, 'entry')).
      on('error', err => this.emit('error', err));

    this._gzipStream.pipe(tarStream);

    const stream = fs.createReadStream(curOpts.source, curOpts.fs);
    stream.on('error', err => this.emit('error', err));
    stream.pipe(this);
  }

  _write(chunk, encoding, callback): void {
    this._gzipStream.write(chunk, encoding, callback);
  }

  _flush(callback): void {
    this._gzipStream.end();
    this.ready(callback);
  }

  ready(this: any, flagOrFunction?: boolean | (() => void)): Promise<void> | void {
    this._ready = Boolean(this._ready);
    this._readyCallbacks = this._readyCallbacks || [];

    if (arguments.length === 0) {
      // 返回一个 Promise
      return new Promise<void>((resolve) => {
        if (this._ready) {
          resolve();
        }
        this._readyCallbacks.push(resolve);
      });
    } else if (typeof flagOrFunction === 'function') {
      this._readyCallbacks.push(flagOrFunction);
    } else {
      this._ready = Boolean(flagOrFunction);
    }

    if (this._ready) {
      this._readyCallbacks.splice(0, Infinity).forEach((callback: () => void) => {
        process.nextTick(callback);
      });
    }
    return new Promise<void>((resolve) => {
      resolve();
    });
  }
}

export const tgzUncompress = uncompressUtil.makeUncompressFn(TgzUncompressStream);