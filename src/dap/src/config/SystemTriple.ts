/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {Arch, OS} from '../types';
import {getArch, getOs} from '../common-utils';

export class SystemTriple {
  private static readonly archMap: Record<string, Arch> = {
    x86_64: 'x86',
    aarch64: 'arm',
  };

  private static readonly osTokens: Record<string, OS> = {
    w64: 'win',
    windows: 'win',
    mingw32: 'win',
    linux: 'linux',
    darwin: 'mac',
    macos: 'mac',
    mac: 'mac',
  };

  public static isMatching(triple: string): boolean {
    const parts = triple.toLowerCase().split('-');
    if (parts.length < 2) {
      return false;
    }
    const arch = SystemTriple.archMap[parts[0]];
    const osPart = parts.slice(1).find(p => p in SystemTriple.osTokens);
    if (!osPart) {
      return false;
    }
    const osNorm = SystemTriple.osTokens[osPart];
    const currentArch = getArch();
    const currentOS = getOs();
    if (!currentArch || !currentOS) {
      return false;
    }
    return arch === currentArch && osNorm === currentOS;
  }
}