/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {WebviewPanel} from 'vscode';
import {Utility} from '../util/utils';

export class SdkManagerUtils {
  static panel: WebviewPanel;

  static closePanel(): void {
    if (Utility.checkIsValid(SdkManagerUtils.panel)) {
      SdkManagerUtils.panel.dispose();
      SdkManagerUtils.panel = undefined;
    }
  }
}