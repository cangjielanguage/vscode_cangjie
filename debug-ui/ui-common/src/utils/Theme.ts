// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import {IdeType} from './Types';

export const TEXT_FONT_FAMILY = 'Segoe WPC,Segoe UI,sans-serif';

export function getBackgroundTheme(ideType: IdeType, isDarkTheme: boolean): string {
  switch (ideType) {
    case 'Deveco':
      return isDarkTheme ? '#3c3f41' : '#ffffff';
    case 'VSCode':
      return isDarkTheme ? '#1e1e1e' : '#ffffff';
    case 'Standalone':
      return isDarkTheme ? '#3c3f41' : '#ffffff';
    default:
      return isDarkTheme ? '#1e1e1e' : '#ffffff';
  }
}
