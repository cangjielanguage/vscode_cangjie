/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Utility } from '../util/utils';
import { LibTreeView } from './require-lib-tree-view';
import { ViewProvider } from './view-provider';
import { requireCategory, CJPM_TOML, requireCategoryNew, packageRequieChild,
  secondPosition, DEV_DEPENDENCIES, DEPENDENCIES, SCRIPT_DEPENDENCIES, VERSION, PACKAGE, NAME, FFI, C, BIN_DEPENDENCIES, PACKAGE_OPTION, PATH_OPTION, TARGET } from '../util/constant-num';
import type { NodeData } from './explorer-node';
import type { RequiresTreeMessage } from '../util/message-data';
import type { CustomTomlTypes } from '../util/toml/toml-types';
import * as toml from '../util/toml/toml-export';

export class RequiresActionController extends ViewProvider {
  public static instace: RequiresActionController;
  private requireContent: CustomTomlTypes = {};
  private delIconUri: vscode.Uri;
  private canSelectFiles: boolean = true;
  private canSelectFolders: boolean = false;


  constructor(context: vscode.ExtensionContext) {
    super(context);
    this.viewType = 'RequiresTreeProvider';
    this.title = 'Configuration Required Tree';
    vscode.commands.registerCommand('cangjie.require.addRequireLibs', (event) => {
      Utility.isCangjieProject() ? this.addLibraries(event) : Utility.noCjpmConfig();
    });

    vscode.commands.registerCommand('cangjie.require.removeRequireLibs', (event) => {
      Utility.isCangjieProject() ? this.removeLibrary(event) : Utility.noCjpmConfig();
    });
  }

  addLibraries(event?: NodeData, message?: RequiresTreeMessage): void {
    if (!Utility.checkIsValid(event) && !Utility.checkIsValid(message)) {
      return;
    }
    const requireType: string = Utility.checkIsValid(event) ? <string>event.label : message.requireType;
    if (!requireCategoryNew.includes(requireType)) {
      return;
    }
    this.canSelectFiles = true;
    this.canSelectFolders = false;
    if ([DEPENDENCIES, DEV_DEPENDENCIES, SCRIPT_DEPENDENCIES, PATH_OPTION].includes(requireType)) {
      this.canSelectFiles = false;
      this.canSelectFolders = true;
    }

    this.showPathDialog(requireType, event);
  }

  protected onMessageReceived(message: RequiresTreeMessage): void {
    super.onMessageReceived(message);
    switch (message.command) {
      case 'initialRequireUI': {
        // get require info from cjpm.toml
        this.updateRequireUI();
        break;
      }
      case 'addRequire': {
        if (Utility.getSdkOption() === 'CJVM' && message.requireType === FFI) {
          vscode.window.showWarningMessage('the ffi is only setted up in CJNative path');
          break;
        }
        this.addLibraries(undefined, message);
        break;
      }
      case 'delRequire': {
        this.removeLibrary(undefined, message);
        break;
      }
      default: {
        break;
      }
    }
  }

  private showPathDialog(requireType: string, event: NodeData): void {
    if (requireType === FFI && Utility.getSdkOption() === 'CJVM') {
      vscode.window.showWarningMessage('the foreign-requires is only setted up in CJNative path');
      return;
    }
    vscode.window.showOpenDialog({
      defaultUri: Utility.getDefaultWorkspaceFolder()?.uri,
      canSelectFiles: this.canSelectFiles,
      canSelectFolders: this.canSelectFolders,
      openLabel: 'Choose the required lib or lib path',
    }).then(async (data) => {
      // choose nothing
      if (!Utility.checkIsValid(data)) {
        return;
      }
      const choosePath = process.platform === 'linux' || process.platform === 'darwin' ? data[0].path : data[0].path.substring(secondPosition);
      const postfix = path.extname(choosePath);
      const curCjpmContent = Utility.getTomlContent();
      if (requireType === PACKAGE_OPTION) {
        if (!await this.choosePackageOption(choosePath, postfix, curCjpmContent)) {
          return;
        }
      } else if (requireType === PATH_OPTION) {
        if (!this.choosePathOption(curCjpmContent, choosePath)) {
          return;
        }
      } else {
        if (!this.chooseOther(requireType, choosePath, curCjpmContent, postfix)) {
          return;
        }
      }

      try {
        const tomlFile = path.join(Utility.getCjRootProjectPath(), CJPM_TOML);
        fs.writeFileSync(tomlFile, toml.stringify(curCjpmContent));
      } catch (error) {
        if (Utility.checkIsValid(error) && 'message' in error) {
          vscode.window.showErrorMessage(error.message);
        }
      }
      // update view tree when parent Item is open
      LibTreeView._instance.updateTreeView('add', event);
      // update UI send message to UI
      this.updateRequireUI(requireType);
    });
  }

  private removeLibrary(event?: NodeData, message?: RequiresTreeMessage): void {
    if (!Utility.checkIsValid(event) && !Utility.checkIsValid(message)) {
      return;
    }
    const requireType = <string>(event?.parent.label) || (message?.requireType);
    const requireField = <string>(event?.label) || (message?.requireName);
    const cjpmContent: CustomTomlTypes = Utility.getTomlContent();
    if (requireType === PACKAGE_OPTION) {
      delete cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PACKAGE_OPTION][requireField];
    } else if (requireType === PATH_OPTION) {
      let index = cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PATH_OPTION].indexOf(requireField);
      if (index > -1) {
        cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PATH_OPTION].splice(index, 1);
      }
    } else if (requireType === FFI) {
      delete cjpmContent[FFI][C];
    } else {
      delete cjpmContent[requireType][requireField];
    }

    try {
      const tomlFile = path.join(Utility.getCjRootProjectPath(), CJPM_TOML);
      fs.writeFileSync(tomlFile, toml.stringify(cjpmContent));
    } catch (error) {
      if (Utility.checkIsValid(error) && 'message' in error) {
        vscode.window.showErrorMessage(error.message);
      }
    }
    // update view tree when parent Item is open
    LibTreeView._instance.updateTreeView('delete', event);
    this.updateRequireUI(requireType);
  }

  private async choosePackageOption(choosePath: string, postfix: string, cjpmContent: CustomTomlTypes): Promise<boolean> {
    let packageName: string;
    let postfixWithoutDot = path.basename(choosePath, postfix);
    let dynamicPostfix = '.so';
    let staticPostfix = '.a';
    if (process.platform === 'win32') {
      dynamicPostfix = '.dll';
    } else if (process.platform === 'darwin') {
      dynamicPostfix = '.dylib';
    }
    if (Utility.getSdkOption() === 'CJVM') {
      staticPostfix = '.cbc';
    }
    if (postfix === staticPostfix || postfix === dynamicPostfix) {
      packageName = `${postfixWithoutDot.replace('lib', '')}`;
    } else {
      vscode.window.showWarningMessage(`Please choose a correct package-require name, only ${staticPostfix} or ${dynamicPostfix} file`);
      return false;
    }
    if (!Utility.checkIsValid(cjpmContent[TARGET])) {
      cjpmContent[TARGET] = {};
    }
    if (!Utility.checkIsValid(cjpmContent[TARGET][Utility.targetOs])) {
      cjpmContent[TARGET][Utility.targetOs] = {};
    }
    if (!Utility.checkIsValid(cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES])) {
      cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES] = {};
    }
    if (!Utility.checkIsValid(cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PACKAGE_OPTION])) {
      cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PACKAGE_OPTION] = {} as JSON;
    }
    const pkgOpt = cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PACKAGE_OPTION][packageName];
    if (Utility.checkIsValid(pkgOpt)) {
      vscode.window.showWarningMessage('The choosed require name already exists');
      return false;
    }
    // have to choose twice, the first time is  to choose name, second time to choose cjo
    const cjoInfo = await vscode.window.showOpenDialog({
      defaultUri: vscode.Uri.file(path.resolve(choosePath, '..')),
      canSelectFiles: true,
      canSelectFolders: false,
      openLabel: 'Choose cjo file',
    });
    if (path.extname(cjoInfo[0].path) !== '.cjo') {
      vscode.window.showWarningMessage('Please choose a correct package require');
      return false;
    }
    cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PACKAGE_OPTION][packageName] = process.platform === 'linux' || process.platform === 'darwin' ? 
      cjoInfo[0].path : cjoInfo[0].path.substring(secondPosition);
    return true;
  }

  private chooseOther(requireType: string, choosePath: string, cjpmContent: CustomTomlTypes, postfix: string): boolean {
    const jsonPath = path.join(choosePath, CJPM_TOML);
    switch (requireType) {
      case DEV_DEPENDENCIES:
      case DEPENDENCIES:
      case SCRIPT_DEPENDENCIES: {
        if (fs.existsSync(jsonPath)) {
          const packageCjpmContent = toml.parse(fs.readFileSync(jsonPath, 'utf8'));
          const packageInfo = Utility.getTomlValueByTreeKeys([PACKAGE], packageCjpmContent, false);
          const addContent: object = {
            path: choosePath,
          };
          if (!Utility.checkIsValid(cjpmContent[requireType])) {
            cjpmContent[requireType] = new Map();
          }
          if (!this.repeatedCheckAndAdd(cjpmContent[requireType], packageInfo[NAME], addContent)) {
            return false;
          }
        } else {
          vscode.window.showWarningMessage('Please choose a correct dependencies');
          return false;
        }
        break;
      }
      case FFI: {
        let importPostfix = '.so';
        if (process.platform === 'win32') {
          importPostfix = '.dll';
        } else if (process.platform === 'darwin') {
          importPostfix = '.dylib';
        }
        if (postfix !== importPostfix) {
          vscode.window.showWarningMessage('Please choose a vailid foreign require');
          return false;
        }
        const libName = path.basename(choosePath, postfix).replace('lib', '');
        if (!Utility.checkIsValid(libName)) {
          vscode.window.showWarningMessage('Please choose a vaild foreign require');
          return false;
        }
        const addContent: object = {
          path: path.dirname(choosePath),
        };
        if (!Utility.checkIsValid(cjpmContent[FFI])) {
          cjpmContent[FFI] = new Map();
        }
        if (!Utility.checkIsValid(cjpmContent[FFI][C])) {
          cjpmContent[FFI][C] = new Map();
        }
        if (!this.repeatedCheckAndAdd(cjpmContent[FFI][C], libName, addContent)) {
          return false;
        }
        break;
      }
      default: {
        break;
      }
    }
    return true;
  }

  private choosePathOption(cjpmContent: CustomTomlTypes, choosePath: string): boolean {
    if (!Utility.checkIsValid(cjpmContent[TARGET])) {
      cjpmContent[TARGET] = {};
    }
    if (!Utility.checkIsValid(cjpmContent[TARGET][Utility.targetOs])) {
      cjpmContent[TARGET][Utility.targetOs] = {};
    }
    if (!Utility.checkIsValid(cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES])) {
      cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES] = {};
    }
    if (!Utility.checkIsValid(cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PATH_OPTION])) {
      cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PATH_OPTION] = [];
    }
    // whether same path
    for (let dir of cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PATH_OPTION]) {
      if (path.resolve(choosePath) === path.resolve(dir)) {
        vscode.window.showWarningMessage('There is already a path with the same name');
        return false;
      }
    }
    cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][PATH_OPTION].push(choosePath);
    return true;
  }

  private updateRequireUI(updateType?: string): void {
    const cjpmContent: CustomTomlTypes = Utility.getTomlContent();
    let sendContent: CustomTomlTypes;
    let curUpdateType = updateType;
    if (Utility.checkIsValid(curUpdateType)) {
      if (packageRequieChild.includes(curUpdateType)) {
        this.requireContent[BIN_DEPENDENCIES] = Utility.checkIsValid(this.requireContent[BIN_DEPENDENCIES]) ?
          this.requireContent[BIN_DEPENDENCIES] : {PACKAGE_OPTION: JSON, PATH_OPTION: []};
        const isValidBinDependencies = Utility.checkIsValid(cjpmContent[TARGET]) && Utility.checkIsValid(cjpmContent[TARGET][Utility.targetOs]) && 
          Utility.checkIsValid(cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES]);
        this.requireContent[BIN_DEPENDENCIES][curUpdateType] = isValidBinDependencies ?
          cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES][curUpdateType] : {};
        sendContent = isValidBinDependencies ? 
          cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES] : {};
        const updateTypeLength = 2;
        curUpdateType = curUpdateType.split('_').slice(0, updateTypeLength).join('_');
      } else {
        this.requireContent[curUpdateType] = cjpmContent[curUpdateType];
        sendContent = cjpmContent[curUpdateType];
      }     
    } else { // initial can not set path_option and package_option only package_requires
      for (let item of requireCategory) {
        if (item === 'bin-dependencies' && Utility.checkIsValid(cjpmContent[TARGET]) && Utility.checkIsValid(cjpmContent[TARGET][Utility.targetOs])) {
          this.requireContent[item] = cjpmContent[TARGET][Utility.targetOs][BIN_DEPENDENCIES];
          continue;
        }
        this.requireContent[item] = cjpmContent[item];
      }
      sendContent = this.requireContent;
    }

    if (Utility.checkIsValid(this.panel)) {
      // initial del Icon Path
      this.delIconUri = Utility.checkIsValid(this.delIconUri) ?
        this.delIconUri :
        this.panel.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'images', 'delete-dark.png')));

      this.panel.webview.postMessage({
        command: 'settedRequire',
        requireLibs: sendContent,
        requireType: curUpdateType ?? 'all',
        uri: this.delIconUri.toString(),
      });
    }
  }

  private repeatedCheckAndAdd(requiresType: object, addName: CustomTomlTypes, addContent: string | object): boolean {
    if (typeof addName !== 'string') {
      vscode.window.showWarningMessage('The choosed require name is invaild!');
      return false;
    }
    if (Utility.checkIsValid(requiresType[addName])) {
      vscode.window.showWarningMessage('The choosed require name already exists');
      return false;
    }
    requiresType[addName] = addContent;
    return true;
  }
}