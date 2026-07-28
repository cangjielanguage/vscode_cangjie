/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {
  DebugAdapterTrackerFactory,
  DebugAdapterTracker,
  DebugSession,
  ProviderResult,
  OutputChannel
} from 'vscode';
import {Tracker} from './tracker';

export class DapMessageTrackerFactory implements DebugAdapterTrackerFactory {
  private readonly out: OutputChannel;

  constructor(out: OutputChannel) {
    this.out = out;
  }

  createDebugAdapterTracker(session: DebugSession): ProviderResult<DebugAdapterTracker> {
    return new Tracker(this.out);
  }
}