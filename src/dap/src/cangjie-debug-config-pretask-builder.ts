/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {BuildType, DebugMacro, DebuggerType, StartDebugType, CangjieBackendType} from './types';
import type {CangjieDebugConfiguration} from './cangjie-debug-configuration';
import type {BuildTaskDefinition} from './task-utils';
import {cangjieBuildType} from './task-utils';
import {randomStr, getOs, getDefaultBuildBinaryPath} from './common-utils';
import {
  debuggeePathPlaceholder,
  debugType, taskTitleSuffixLength
} from './constants';
import * as path from 'path';
import {createSingleFileBuildCommand, getTargetFilePathFromSourcePath} from './build-utils';
import type {WorkspaceFolder} from 'vscode';
import {CangjieEnvConfiguration} from './cangjie-env-configuration';
import {execSync} from "child_process";

/**
 * builder class for launch.json and tasks.json objects, can be used only once
 */
export class CangjieDebugConfigAndPreTaskBuilder {
  public static readonly buildTaskPrefix = `${debugType} build task - `;

  private _debuggerType: DebuggerType;
  private _startDebugType: StartDebugType;
  private _debugMacro: DebugMacro;
  private _cangjieBackendType: CangjieBackendType = 'CJNative';
  private _buildType: BuildType;
  private _execPath: string;
  private execName: string;
  private _sourceFilePath: string;
  private _workspaceFolder: WorkspaceFolder;

  private preTasks: BuildTaskDefinition[] = [];
  private preLaunchTaskLabel: string =
  `${CangjieDebugConfigAndPreTaskBuilder.buildTaskPrefix}${randomStr(taskTitleSuffixLength)}`;

  get debuggerType(): DebuggerType {
    return this._debuggerType;
  }

  set debuggerType(value: DebuggerType) {
    this._debuggerType = value;
  }

  get startDebugType(): StartDebugType {
    return this._startDebugType;
  }

  set startDebugType(value: StartDebugType) {
    this._startDebugType = value;
  }

  get debugMacro(): DebugMacro {
    return this._debugMacro;
  }

  set debugMacro(value: DebugMacro) {
    this._debugMacro = value;
  }

  get cangjieBackendType(): CangjieBackendType {
    return this._cangjieBackendType;
  }

  set cangjieBackendType(value: CangjieBackendType) {
    this._cangjieBackendType = value;
  }

  get buildType(): BuildType {
    return this._buildType;
  }

  set buildType(value: BuildType) {
    this._buildType = value;
  }

  get execPath(): string {
    return this._execPath;
  }

  set execPath(value: string) {
    this._execPath = value;
    this.execName = path.basename(value);
  }

  get sourceFilePath(): string {
    return this._sourceFilePath;
  }

  set sourceFilePath(value: string) {
    this._sourceFilePath = value;
    const execPath = getTargetFilePathFromSourcePath(value, this.cangjieBackendType === 'CJVM');
    if (execPath) {
      this.execPath = execPath;
    }
  }

  get workspaceFolder(): WorkspaceFolder {
    return this._workspaceFolder;
  }

  set workspaceFolder(value: WorkspaceFolder) {
    this._workspaceFolder = value;
  }

  public buildConfig(noPreTask?: boolean): CangjieDebugConfiguration {
    let name: string;
    let request: StartDebugType;
    let program: string;
    let buildBeforeLaunch: boolean;
    let debugMacro: boolean;
    let stopAtEntry: boolean;
    let backendType: string = this.cangjieBackendType;
    switch (this.buildType) {
      case 'singleFile':
      case 'singleFile(CJVM)':
        name = `Cangjie (${backendType}): ${this.execName}`;
        request = 'launch';
        program = this.execPath;
        break;
      case 'cangjieProject':
        name = `Cangjie (${backendType}): ${this.startDebugType}`;
        request = this.startDebugType;
        program = getDefaultBuildBinaryPath(this.cangjieBackendType === 'CJVM');
        buildBeforeLaunch = true;
        debugMacro = false;
        break;
      case 'chooseFile':
        name = `Cangjie (${backendType}): ${this.startDebugType}`;
        request = this.startDebugType;
        program = debuggeePathPlaceholder;
        break;
      default:
        break;
    }
    if (this.debugMacro === 'debugMacro') {
      name += ` (${this.debugMacro})`;
      debugMacro = true;
      stopAtEntry = true;
    }
    const config: CangjieDebugConfiguration = {
      name,
      program,
      request,
      type: debugType,
    };
    if (this.startDebugType === 'launch') {
      config.externalConsole = false;
      config.buildBeforeLaunch = buildBeforeLaunch;
      if (this.cangjieBackendType === 'CJNative') {
        config.env = {};
      }
    } else {
      config.remote = false;
      config.processId = '';
      config.remoteAddress = '';
      config.remotePlatform = '';
      if (getOs() === 'linux') {
        config.remotePlatform = 'remote-linux';
      }
    }
    if (this.cangjieBackendType === 'CJVM') {
      config.vmMode = true;
      config.vmPort = 3001;
      config.buildBeforeLaunch = buildBeforeLaunch;
    }
    if (noPreTask !== true) {
      const taskDef = this.buildPreTask();
      if (taskDef && taskDef.length > 0) {
        config.preLaunchTask = this.preLaunchTaskLabel;
      }
    }
    config.debugMacro = debugMacro;
    config.stopAtEntry = stopAtEntry;
    return config;
  }

  // preTasks 目前不作处理，采用手动编译方式进行调试，后期需增加自动编译
  public buildPreTask(): BuildTaskDefinition[] {
    if (this.preTasks.length > 0) {
      return this.preTasks;
    }
    if (this.startDebugType === 'attach') {
      return [];
    }
    switch (this.buildType) {
      case 'singleFile': {
        const compilerPath = new CangjieEnvConfiguration('CJNative').getCjcPath();
        this.setPreTasks(compilerPath, false);
        break;
      }
      case 'singleFile(CJVM)': {
        const compilerPath = new CangjieEnvConfiguration('CJVM').getCjcPath();
        this.setPreTasks(compilerPath, true);
        break;
      }
      case 'cangjieProject':
        break;
      case 'chooseFile':
        break;
      default:
        break;
    }
    return this.preTasks;
  }

  private setPreTasks(compilerPath: string, vmMode: boolean): void {
    const buildCommand = createSingleFileBuildCommand(compilerPath, this.sourceFilePath, vmMode);
    const [cmd] = buildCommand;
    buildCommand.shift();
    this.preTasks = [
      {
        type: cangjieBuildType,
        cmd,
        args: buildCommand,
        label: this.preLaunchTaskLabel,
      },
    ];
    if (getOs() === 'mac') {
      let options = {
        env: {
          "SDKROOT": CangjieDebugConfigAndPreTaskBuilder.getMacSdkRoot()
        }
      };
      this.preTasks[0]['options'] = options;
    }
  }

  private static getMacSdkRoot(): string {
    let sdkRoot = '';
    try {
      sdkRoot = execSync('xcrun --sdk macosx --show-sdk-path', {windowsHide: true}).toString().replace(/\n/g, '');
    } catch (error) {
      // do nothing
    }
    return sdkRoot.trimEnd();
  }
}