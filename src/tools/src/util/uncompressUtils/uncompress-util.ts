/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type * as vscode from 'vscode';
import * as path from 'path';
import { Utility } from '../utils';
import type { ZipUncompressStream } from './zip/uncompress-stream';
import type { TgzUncompressStream } from './tgz/uncompress-stream';
import * as fs from 'fs';
import * as fsp from 'fs/promises';

export const makeUncompressFn = (StreamClass: typeof ZipUncompressStream | typeof TgzUncompressStream) => {
  return (source: string, destDir: string, token: vscode.CancellationToken, opts?: { source?: string; mode?: number; sourceType?: string }): Promise<void> => {
    const curOpts = opts ?? {};
    curOpts.source = source;
    if (!Utility.checkIsValid(source)) {
      const error = new Error('Type is not supported, must be a file path, file buffer, or a readable stream');
      error.name = 'IllegalSourceError';
      throw error;
    }

    return new Promise<void>((resolve, reject) => {
      let entryCount = 0;
      let successCount = 0;
      let isFinish = false;

      function done(): void {
        if (isFinish && entryCount === successCount) {
          resolve();
        }
      }

      function rejectError(err): void {
        if (Utility.checkIsValid(err)) {
          reject(err);
        }
      }

      function handle(stream, next, header): void {
        if (token.isCancellationRequested) {
          stream.destroy();
          resolve();
        }
        stream.on('end', next);
        if (header.type !== 'file') {
          fsp.mkdir(path.resolve(destDir, header.name), {recursive: true}).then((resultData) => {
            stream.resume();
          }).catch((err) => {
            rejectError(err);
          });
          return;
        }
        const fullPath = path.resolve(destDir, header.name);
        fsp.mkdir(path.dirname(fullPath), {recursive: true}).then((resultData) => {
          entryCount++;
          stream.pipe(fs.createWriteStream(fullPath, {mode: curOpts.mode ?? header.mode}));
          successCount++;
          done();
        }).catch((err) => {
          rejectError(err);
        });
      }

      function handleEntryData(): void {
        new StreamClass(curOpts, token).on('finish', () => {
          isFinish = true;
          done();
        }).on('error', reject).on('entry', (header, stream, next) => {
          handle(stream, next, header);
        });
      }

      handleEntryData();
    });
  };
};

export function stripFileName(strip, fileName, type): string {
  let curFileName = fileName;
  if (Buffer.isBuffer(curFileName)) {
    curFileName = curFileName.toString();
  }

  if (curFileName.indexOf('\\') !== -1) {
    curFileName = curFileName.replace(/\\+/g, '/');
  }

  if (curFileName[0] === '/') {
    curFileName = curFileName.replace(/^\/+/, '');
  }

  let s = curFileName.split('/');

  if (s.indexOf('..') !== -1) {
    curFileName = path.normalize(curFileName);
    if (process.platform === 'win32') {
      curFileName = curFileName.replace(/\\+/g, '/');
    }
    // replace '../' on ../../foo/bar
    curFileName = curFileName.replace(/(\.\.\/)+/, '');
    if (type === 'directory' && curFileName && curFileName[curFileName.length - 1] !== '/') {
      curFileName += '/';
    }
    s = curFileName.split('/');
  }

  const curStrip = Math.min(strip, s.length - 1);
  return s.slice(curStrip).join('/') || '/';
}

export const clone: any = obj => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    newObj[key] = obj[key];
  });
  return newObj;
};