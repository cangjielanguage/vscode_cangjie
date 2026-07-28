/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import {ConfigurationTarget} from 'vscode';
import {Utility} from '../util/utils';
import {SdkManagerUtils} from './sdk-manager-utils';
import * as path from 'path';
import * as fs from 'fs';
import {execSync} from 'child_process';

export class SdkConfigurationView {
  private disposable: vscode.Disposable;

  constructor(readonly context: vscode.ExtensionContext) {
    this.disposable = vscode.Disposable.from(
      vscode.commands.registerCommand('cangjie.sdk.manager.view', () => {
        if (process.platform !== 'linux' && process.platform !== 'win32' && process.platform !== 'darwin') {
          vscode.window.showInformationMessage('This command applies only to Linux, Windows and Mac.');
          return;
        }
        this.init(context.extensionPath);
      })
    );
  }

  dispose(): void {
    this.disposable.dispose();
  }

  init(extensionPath: string): void {
    if (Utility.checkIsValid(SdkManagerUtils.panel)) {
      const columnToShowIn = Utility.checkIsValid(vscode.window.activeTextEditor) ?
        vscode.window.activeTextEditor.viewColumn : undefined;
      SdkManagerUtils.panel.reveal(columnToShowIn);
      return;
    }
    SdkManagerUtils.panel = vscode.window.createWebviewPanel(
      'sdkManagerView',
      'CangjieSDKConfiguration',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );
    SdkManagerUtils.panel.onDidDispose(SdkManagerUtils.closePanel);
    const htmlPath = path.join(extensionPath, 'html', 'sdkManager.html');
    SdkManagerUtils.panel.webview.html = fs.readFileSync(htmlPath, 'utf8');
    SdkManagerUtils.panel.webview.onDidReceiveMessage(
      async message => {
        await this.dealCommandMessage(message);
      },
      undefined,
      this.context.subscriptions
    );
  }

  private async dealCommandMessage(message): Promise<void> {
    switch (message.command) {
      case 'selectFolder': {
        const uri = await vscode.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          title: 'Select Cangjie SDK Folder',
        });
        if (Utility.checkIsValid(uri) && Utility.checkIsValid(uri[0])) {
          const sdkPath = uri[0].fsPath;
          SdkManagerUtils.panel.webview.postMessage({
            command: 'folderSelected',
            path: sdkPath,
          });
          await this.saveSdkData(sdkPath);
        }
        break;
      }
      case 'loadSdkData': {
        this.loadSdkData();
        break;
      }
      case 'saveSelectedSdk':
        await this.saveSelectedSdk(message);
        break;
      case 'deleteSdk':
        await this.deleteSdk(message);
        break;
      default:
        break;
    }
  }

  private loadSdkData(): void {
    const globalAllCjSdks = this.context.globalState.get(this.getSdkStorageKey());
    const projectSelectedCjSdk = this.context.workspaceState.get('projectSelectedCjSdk');
    SdkManagerUtils.panel.webview.postMessage({
      command: 'sdkDataLoaded',
      globalAllCjSdks: globalAllCjSdks,
      projectSelectedCjSdk: projectSelectedCjSdk,
    });
  }

  private async deleteSdk(message): Promise<void> {
    const globalAllCjSdks = this.context.globalState.get<string>(this.getSdkStorageKey());
    let sdks = [];
    if (globalAllCjSdks !== undefined) {
      sdks = JSON.parse(globalAllCjSdks);
    }
    const sdkToDeletePath = message.sdkPath;
    const sdkToDelete = sdks.filter(sdk => sdk.path === sdkToDeletePath);
    const updatedSdks = sdks.filter(sdk => sdk.path !== sdkToDeletePath);
    const updatedSdkStr = JSON.stringify(updatedSdks);
    if (sdkToDelete !== null && sdkToDelete.length > 0) {
      await this.context.globalState.update(this.getSdkStorageKey(), updatedSdkStr);
    }
    let projectSelectedCjSdk = this.context.workspaceState.get('projectSelectedCjSdk');
    if (projectSelectedCjSdk === sdkToDeletePath) {
      await this.context.workspaceState.update('projectSelectedCjSdk', sdkToDeletePath);
      projectSelectedCjSdk = '';
    }
    SdkManagerUtils.panel.webview.postMessage({
      command: 'sdkDeleted',
      result: true,
      globalAllCjSdks: updatedSdkStr,
      projectSelectedCjSdk: projectSelectedCjSdk,
    });
  }

  private async saveSelectedSdk(message): Promise<void> {
    const sdkPath = message.sdkPath;
    await this.context.workspaceState.update('projectSelectedCjSdk', sdkPath);
    const sdkOption = message.sdkOption;
    if (Utility.checkIsValid(sdkOption) && Utility.checkIsValid(sdkPath)) {
      await vscode.workspace.getConfiguration('CangjieSdk').update('Option', sdkOption, ConfigurationTarget.Workspace);
      if (sdkOption === 'CJNative') {
        await vscode.workspace.getConfiguration('CangjieSdkPath').
          update('CJNativeBackend', sdkPath, ConfigurationTarget.Workspace);
      } else {
        await vscode.workspace.getConfiguration('CangjieSdkPath').
          update('CJVMBackend', sdkPath, ConfigurationTarget.Workspace);
      }
    }
  }

  private async saveSdkData(sdkPath: string): Promise<void> {
    const sdkInfo = this.getSdkInfo(sdkPath);
    const cjcVersion = sdkInfo.version;
    let sdkName;
    if (cjcVersion !== undefined && cjcVersion !== '') {
      sdkName = `Cangjie-${cjcVersion}`;
    } else {
      sdkName = `Cangjie`;
    }
    let globalAllCjSdks = this.context.globalState.get<string>(this.getSdkStorageKey());
    let sdks = [];
    if (globalAllCjSdks !== undefined) {
      sdks = JSON.parse(globalAllCjSdks);
    }
    const newSdk = {name: sdkName, type: sdkInfo.type, path: sdkPath};
    const sdkToAdd = sdks.filter(sdk => sdk.path === sdkPath);
    if (sdkToAdd === null || sdkToAdd.length === 0) {
      sdks.push(newSdk);
      globalAllCjSdks = JSON.stringify(sdks);
      await this.context.globalState.update(this.getSdkStorageKey(), globalAllCjSdks);
    }
    SdkManagerUtils.panel.webview.postMessage({
      command: 'dataSaved',
      result: true,
      globalAllCjSdks: globalAllCjSdks,
      projectSelectedCjSdk: sdkPath,
    });
  }

  private getSdkStorageKey(): string {
    const remoteName = vscode.env.remoteName;
    if (remoteName) {
      return `globalAllCjSdks_${remoteName}`;
    } else {
      return 'globalAllCjSdks_local';
    }
  }

  private getSdkInfo(cangjieHome: string): SdkInfo {
    let command = '';
    if (process.platform === 'win32') {
      const envScriptPath = path.join(cangjieHome, 'envsetup.bat');
      if (fs.existsSync(envScriptPath)) {
        command = `"${envScriptPath}" && cjc -v`;
      }
    } else if (process.platform === 'linux' || process.platform === 'darwin') {
      const envScriptPath = path.join(cangjieHome, 'envsetup.sh');
      if (fs.existsSync(envScriptPath)) {
        command = `bash -c "source '${envScriptPath}' && cjc -v"`;
      }
    }
    const defaultSdkInfo = {version: '', type: 'CJNative'};
    if (!Utility.checkIsValid(command)) {
      showSdkInfoError();
      return defaultSdkInfo;
    }
    try {
      const cjcInfo = execSync(command, {encoding: 'utf8', stdio: 'pipe'});
      const output = cjcInfo.toString().trim();
      const match = output.match(/Cangjie Compiler:\s*(?<version>[^\s(]+)\s*\((?<typeIdentifier>[^)]+)\)/);
      if (match?.groups.version && match?.groups.typeIdentifier) {
        const type = backendMap.get(match.groups.typeIdentifier) ?? 'CJNative';
        return {version: match.groups.version, type: type};
      }
      const fallbackMatch = output.match(/Cangjie Compiler:\s*(?<version>[^\s(]+)/);
      if (fallbackMatch?.groups.version) {
        showSdkInfoError();
        return {version: fallbackMatch.groups.version, type: 'CJNative'};
      }
      showSdkInfoError();
      return defaultSdkInfo;
    } catch (error) {
      showSdkInfoError();
      return defaultSdkInfo;
    }
  }
}

function showSdkInfoError(): void {
  vscode.window.showErrorMessage('Failed to obtain the Cangjie SDK information.');
}

interface SdkInfo {
  version: string;
  type: string;
}

const backendMap: Map<string, string> = new Map([
  ['cjnative', 'CJNative'],
  ['cjvm', 'CJVM'],
]);