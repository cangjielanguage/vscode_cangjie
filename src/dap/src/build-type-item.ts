/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {QuickPickItem} from 'vscode';
import type {BuildType} from './types';

export class BuildTypeItem implements QuickPickItem {
  label: string;
  buildType: BuildType;

  constructor(buildType: BuildType) {
    this.buildType = buildType;
    switch (buildType) {
      case 'singleFile':
        this.label = 'Build And Debug Single Source File';
        break;
      case 'singleFile(CJVM)':
        this.label = 'Build And Debug Single Source File (CJVM)';
        break;
      case 'cangjieProject':
        this.label = 'Build And Debug Cangjie Project';
        break;
      case 'chooseFile':
        this.label = 'Choose Executable File Later';
        break;
      default:
        break;
    }
  }
}