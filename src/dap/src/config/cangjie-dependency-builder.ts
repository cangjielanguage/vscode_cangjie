/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as path from 'path';
import {CangjieDependency} from './cangjie-dependency';
import {checkIsValid, getArch, getOs, getSdkPath, isEmpty} from '../common-utils';
import {workspace} from "vscode";

export class CangjieDependencyBuilder {
  public addRuntimePath: boolean = true;

  private _isUnittest: boolean = false;

  private separator = getOs() === 'win' ? ';' : ':';

  constructor(vmMode: boolean = false) {
    this.addRuntimePath = !checkIsValid(vmMode);
  }

  public isUnittest(isUnittest: boolean) {
    this._isUnittest = isUnittest;
    return this;
  }

  public static appendRuntimePath(env: any) {
    let newEnv = {};
    let envKey = getOs() === 'win' ? 'Path' : getOs() === 'linux' ? 'LD_LIBRARY_PATH' : 'DYLD_LIBRARY_PATH';
    let separator = getOs() === 'win' ? ';' : ':';
    if (isEmpty(env) || isEmpty(env[envKey])) {
      newEnv[envKey] = this.getRuntimePath() + separator + this.appendSystemEnv();
    } else {
      newEnv[envKey] = env[envKey] + separator + this.getRuntimePath();
    }
    return newEnv;
  }

  private static getRuntimePath(): string {
    let osSystemName = process.platform === 'linux' ? 'linux' : process.platform === 'win32' ? 'windows' : 'osx';
    let envConfig = JSON.parse(JSON.stringify(workspace.getConfiguration('terminal.integrated.env').get(osSystemName)));
    if (checkIsValid(envConfig) && checkIsValid(envConfig.CANGJIE_PATH)) {
      let curOs = getOs();
      if (curOs === 'win' && checkIsValid(envConfig.CANGJIE_PATH)) {
        return envConfig.CANGJIE_PATH;
      } else if (curOs === 'linux' && checkIsValid(envConfig.CANGJIE_LD_LIBRARY_PATH)) {
        return envConfig.CANGJIE_LD_LIBRARY_PATH;
      }
    }
    return this.getDefaultRuntimePath();
  }

  private static getDefaultRuntimePath(): string {
    let sdkPath = getSdkPath();
    switch (getOs()) {
      case 'win':
        return path.join(sdkPath, 'runtime', 'lib', 'windows_x86_64_cjnative');
      case 'linux':
        switch (getArch()) {
          case 'arm':
            return path.join(sdkPath, 'runtime', 'lib', 'linux_aarch64_cjnative');
          case 'x86':
            return path.join(sdkPath, 'runtime', 'lib', 'linux_x86_64_cjnative');
          default:
            return '';
        }
      case 'mac':
        switch (getArch()) {
          case 'arm':
            return path.join(sdkPath, 'runtime', 'lib', 'darwin_aarch64_cjnative');
          case 'x86':
            return path.join(sdkPath, 'runtime', 'lib', 'darwin_x86_64_cjnative');
          default:
            return '';
        }
      default:
        return '';
    }
  }

  private static appendSystemEnv(): string {
    switch (getOs()) {
      case 'win':
        return '${env:Path}';
      case 'linux':
        return '${env:LD_LIBRARY_PATH}';
      case 'mac':
        return '${env:DYLD_LIBRARY_PATH}';
      default:
        return '';
    }
  }

  public async builder(oldConfig?: string, appendOldConf?: boolean, appendSystemEnv = true): Promise<string> {
    let cangjieDenpency = new CangjieDependency();
    await cangjieDenpency.getAllDependencies(this._isUnittest);
    let {dependencyModuleSet} = cangjieDenpency;
    if (checkIsValid(appendSystemEnv)) {
      dependencyModuleSet.add(CangjieDependencyBuilder.appendSystemEnv());
    }
    if (checkIsValid(oldConfig) && checkIsValid(appendOldConf)) {
      let dependencies = oldConfig.split(this.separator).map(e => path.normalize(e));
      dependencyModuleSet.forEach(e => {
        let temp = path.normalize(e);
        if (!dependencies.includes(temp)) {
          dependencies.push(temp);
        }
      });
      return dependencies.join(this.separator);
    }
    if (dependencyModuleSet.size === 1) {
      return '';
    }
    return Array.from(dependencyModuleSet).join(this.separator);
  }
}