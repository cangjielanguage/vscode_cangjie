/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';
import {execSync} from 'child_process';
import {checkIsValid, getOs, getSdkPath} from '../common-utils';
import {pythonPathSettingsName, toolsSettingsPrefix} from '../constants';

/**
 * python 环境验证
 */
export class PythonRuntimeValidator {
  /**
   * 检查python环境
   *
   * @return 用户配置的python路径
   */
  static ensurePythonRuntime(): string {
    let cangjiePath = getSdkPath();
    let toolsPyVer = PythonRuntimeValidator.detectToolsPythonVersion(cangjiePath);
    if (!checkIsValid(toolsPyVer)) {
      // sdk中未检测到python依赖，无需做python环境配置
      return undefined;
    }
    // python环境配置
    let pythonPath = PythonRuntimeValidator.getPythonPath();
    if (checkIsValid(pythonPath)) {
      // 检查用户python路径合法性以及版本是否和预期匹配
      PythonRuntimeValidator.validateUserConfiguredPython(pythonPath, toolsPyVer);
      return pythonPath;
    }
    // 用户未配置python环境，检查系统python环境及版本是否和预期匹配
    return PythonRuntimeValidator.validateSystemPython(toolsPyVer);
  }

  /**
   * 检测sdk中python依赖
   *
   * @param cangjiePath cangjie sdk path
   * @return cjdb依赖的pyton版本
   */
  static detectToolsPythonVersion(cangjiePath: string): string {
    const toolsDir = getOs() === 'win' ? path.join(cangjiePath, 'tools', 'lib') :
      path.join(cangjiePath, 'third_party', 'llvm', 'lib');
    if (!fs.existsSync(toolsDir)) {
      return undefined;
    }

    const entries = fs.readdirSync(toolsDir, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('python')) {
        const version = entry.name.substring('python'.length);
        if (/^\d+\.\d+$/.test(version)) {
          return version;
        }
      }
    }

    return undefined;
  }

  /**
   * 校验用户在 settings 中配置的 pythonPath 是否符合要求
   *
   * @param pythonPath python path
   * @param requiredPyVer 要求的 python 版本
   */
  static validateUserConfiguredPython(pythonPath: string, requiredPyVer: string): void {
    if (!fs.existsSync(pythonPath)) {
      throw new Error(`Debug start failed: configured pythonPath does not exist: ${pythonPath}`);
    }
    const versions = this.getConfiguredPythonVersion(pythonPath);
    if (versions.size === 0) {
      throw new Error(`Debug start failed: no Python executable found in configured pythonPath: ${pythonPath}.`);
    }
    if (!versions.has(requiredPyVer)) {
      throw new Error(`Debug start failed: python version mismatch. Found ${versions.keys()}, required ${requiredPyVer}.`);
    }
  }

  /**
   * 校验系统环境中的 python 是否符合要求
   *
   * @param requiredPythonVersion 要求的 python 版本
   */
  static validateSystemPython(requiredPythonVersion: string): string {
    let versions = this.getPythonVersions();
    if (versions.size === 0) {
      throw new Error(`Debug start failed: requires Python ${requiredPythonVersion}. Please configure Python environment.`);
    }
    if (!versions.has(requiredPythonVersion)) {
      throw new Error(`Debug start failed: python version mismatch. Found ${versions.keys()}, required ${requiredPythonVersion}.`);
    }
    return versions.get(requiredPythonVersion);
  }

  /**
   * 获取 python 版本
   *
   * @param pythonPath 用户配置的pythonPath
   * @return python&python3 version
   */
  static getConfiguredPythonVersion(pythonPath: string): Map<string, string> {
    const env = {...process.env};
    const libPath = path.join(path.dirname(pythonPath), 'lib');
    if (getOs() === 'linux') {
      env.LD_LIBRARY_PATH = [pythonPath, `pythonPath/lib`, `${env.LD_LIBRARY_PATH}`].filter(Boolean).join(':');
    } else if (getOs() === 'mac') {
      env.DYLD_LIBRARY_PATH = libPath + (env.DYLD_LIBRARY_PATH ? `:${env.DYLD_LIBRARY_PATH}` : '');
    } else if (getOs() === 'win') {
      env.PATH = path.dirname(pythonPath) + (env.PATH ? `;${env.PATH}` : '');
    } else {
      return null;
    }
    return this.getPythonVersions(pythonPath, env);
  }

  /**
   * 获取 python 版本
   *
   * @param pythonPath 用户配置的pythonPath
   * @param env env
   * @return python&python3 version
   */
  static getPythonVersions(pythonPath?: string, env?: NodeJS.ProcessEnv): Map<string, string> {
    const results: Map<string, string> = new Map<string, string>();
    let pythonPathValid = checkIsValid(pythonPath);
    let candidates = pythonPathValid
      ? [path.join(pythonPath, 'python'), path.join(pythonPath, 'python3')]
      : ['python', 'python3'];
    for (let cmd of candidates) {
      cmd = getOs() === 'win' ? `${cmd}.exe` : cmd;
      if (pythonPathValid) {
        if (!fs.existsSync(cmd)) {
          continue;
        }
        cmd = `"${cmd}"`;
      }
      try {
        const output = execSync(`${cmd} --version`, {
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'pipe'],
          env: pythonPathValid ? env : process.env,
        });
        let match = output.match(/Python\s+(?<version>\d+\.\d+)/);
        if (match) {
          if (!pythonPathValid) {
            let whichCmd = process.platform === 'win32' ? 'where' : 'which';
            const pathStdout = execSync(`${whichCmd} ${cmd}`, {
              encoding: 'utf-8',
              stdio: ['ignore', 'pipe', 'pipe'],
              env: process.env,
            });
            pythonPath = path.dirname(pathStdout.split('\n')[0].trim());
          }
          results.set(match[1], pythonPath);
        }
      } catch {
        // do nothing
      }
    }
    return results;
  }

  /**
   * 获取 settings 中 pythonPath 配置
   *
   * @return 用户配置的python路径
   */
  static getPythonPath(): string {
    return <string>vscode.workspace.getConfiguration(toolsSettingsPrefix).get(pythonPathSettingsName);
  }
}