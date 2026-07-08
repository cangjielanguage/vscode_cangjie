// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import {IdeType} from './Types';
import {getBackgroundTheme} from './Theme';

declare const ideType: IdeType;

export function getIdeType(): IdeType {
  try {
    return ideType;
  } catch (e) {
    return 'Standalone';
  }
}

export function setBackground(currentIdeType: IdeType, isThemeDark: boolean): void {
  if (currentIdeType === 'Deveco' || currentIdeType === 'Standalone') {
    document.body.style.backgroundColor = getBackgroundTheme(currentIdeType, isThemeDark);
  }
}
