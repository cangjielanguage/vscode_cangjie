/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {Disposable} from 'vscode';

export class MyDisposable implements Disposable {
  private _disposed = false;

  get disposed(): boolean {
    return this._disposed;
  }

  dispose(): any {
    this._disposed = true;
  }
}