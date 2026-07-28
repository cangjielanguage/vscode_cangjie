/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import { Utility } from './utils';
import { MUSTKEYOFMODULEJSON as MUSTKEYOFPACKAGE, CJPM_TOML, PACKAGE, WORKSPACE, MEMBERS} from './constant-num';
import { window } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { checkIsValid } from '../../../dap/src/common-utils';

export class CheckConfig {
  static checkCjpmKey(): boolean {
    // no cjpm.toml
    if (!fs.existsSync(path.join(Utility.getCjRootProjectPath(), CJPM_TOML))) {
      return true;
    }

    // 支持cjpm的两种配置模式
    const workspace_info = Utility.getTomlValueByTreeKeys([WORKSPACE], undefined, true);
    const package_info = Utility.getTomlValueByTreeKeys([PACKAGE], undefined, true);
    if (checkIsValid(workspace_info) && checkIsValid(package_info)) {
      window.showErrorMessage('Only one of workspace or package fields can exist at cjpm.toml.');
      return false;
    }

    // 1.workspace模式，指示了当前toml所在根目录是由多个模块的集合，
    // workspace模式插件会检查workspace中必须的字段
    if (checkIsValid(workspace_info)) {
      const workspace_keys = Object.keys(workspace_info);
      if (!workspace_keys.includes(MEMBERS)) {
        window.showErrorMessage('The cjpm.toml is missing required field members');
        return false;
      }
      return true;
    }
  
    // 2.package模式，指示了当前toml所在根目录是一个模块
    // package模式插件会检查package中必须的字段
    const curJsonKeys = Object.keys(package_info);
    for (let jsonKey of MUSTKEYOFPACKAGE) {
      if (!curJsonKeys.includes(jsonKey)) {
        window.showErrorMessage(`The cjpm.toml is missing required field ${jsonKey}`);
        return false;
      }
    }

    return true;
  }
}