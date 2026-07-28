/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {DebugProtocol} from '@vscode/debugprotocol';
import {MyDisposable} from './my-disposable';

export class DapMessageListener {
  readonly listenerFunction: (msg: DebugProtocol.ProtocolMessage) => void;
  private _disposable = new MyDisposable();


  constructor(listenerFunction: (msg: DebugProtocol.ProtocolMessage) => void) {
    this.listenerFunction = listenerFunction;
  }

  get disposable(): MyDisposable {
    return this._disposable;
  }
}