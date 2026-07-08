/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import {Utility} from '../util/utils';
import {TerminalHelper} from '../util/ternimal-helper';
import { PickItemStruct, State } from './multi-step-select';
import { InputStep, MultiStepChoose } from './multi-step-choose';

export enum InstallArgsCollection {
  INSTALL_WITH_VERBOSE = 'cjpm install -V',
  INSTALL_WITH_DEBUG = 'cjpm install -g',
  INSTALL_WITH_ROOT = 'cjpm install --root ',
  INSTALL_WITH_TARGETDIR = 'cjpm install --target-dir ',
  INSTALL_WITH_ALIAS = 'cjpm install --name ',
  INSTALL_WITH_GIT = 'cjpm install --git ',
  INSTALL_WITH_LSIT = 'cjpm install --list',
  INSTALL_WITH_SKIP_BUILD = 'cjpm install --skip-build',
  INSTALL_WITH_JOBS = 'cjpm install -j ',
  INSTALL_WITH_CUSTOMIZED_OPTION = 'cjpm install --cfg ',
  INSTALL_WITH_SKIP_SCRIPT = 'cjpm install --skip-script',
  INSTALL_WITH_CUSTOM_PARAMETER = 'cjpm install ',
  UNINSTALL_BINARY = 'cjpm uninstall',
  UNINSTALL_WITH_ROOT = 'cjpm uninstall --root ',
}
// xxx TerminalHelper.execCommand  xxx
export class CjpmInstallCollection {
  public context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;

    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.verbose', () => {
      TerminalHelper.execCommand(InstallArgsCollection.INSTALL_WITH_VERBOSE);
    }));

    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.debug', async () => {
      TerminalHelper.execCommand(InstallArgsCollection.INSTALL_WITH_DEBUG);
    }));

    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.list', () => {
      TerminalHelper.execCommand(InstallArgsCollection.INSTALL_WITH_LSIT);
    }));

    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.skipBuild', () => {
      TerminalHelper.execCommand(InstallArgsCollection.INSTALL_WITH_SKIP_BUILD);
    }));

    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.skipScript', () => {
      TerminalHelper.execCommand(InstallArgsCollection.INSTALL_WITH_SKIP_SCRIPT);
    }));

    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.rootPath', async () => {
      const title: string = 'Input custom directory path where binary be installed.';
      const placeHolder: string = 'Default path: $HOME/.cjpm on Linux/MacOs, %USERPROFILE%/.cjpm on Windows';
      const input: string = await this.getContentByInputBox(InstallArgsCollection.INSTALL_WITH_ROOT, title, placeHolder);
      if (!Utility.checkIsValid(input)) {
        TerminalHelper.execCommand(`${InstallArgsCollection.INSTALL_WITH_CUSTOM_PARAMETER} ${input}`);
        return;
      }
      TerminalHelper.execCommand(`${InstallArgsCollection.INSTALL_WITH_ROOT} ${input}`);
    }));

    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.targetDir', async () => {
      const title: string = 'Input custom directory path where build output be placed.';
      const input: string = await this.getContentByInputBox(InstallArgsCollection.INSTALL_WITH_TARGETDIR, title);
      if (!Utility.checkIsValid(input)) {
        return;
      }
      TerminalHelper.execCommand(`${InstallArgsCollection.INSTALL_WITH_TARGETDIR} ${input}`);
    }));

    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.alias', async () => {
      const title: string = 'Input custom binary name.';
      const input: string = await this.getContentByInputBox(InstallArgsCollection.INSTALL_WITH_ALIAS, title);
      if (!Utility.checkIsValid(input)) {
        return;
      }
      TerminalHelper.execCommand(`cjpm build -o ${input}&&${InstallArgsCollection.INSTALL_WITH_ALIAS} ${input}`);
    }));

    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.jobs', async () => {
      const title: string = 'Set the maximum number of concurrencies when install';
      const input: string = await this.getContentByInputBox(InstallArgsCollection.INSTALL_WITH_JOBS, title);
      if (!Utility.checkIsValid(input)) {
        return;
      }
      TerminalHelper.execCommand(`${InstallArgsCollection.INSTALL_WITH_JOBS} ${input}`);
    }));

    this.registerUninstallCommand();

    this.registerInstallWithCustonParameter();

    this.registerInstallWithCustomizedOption();

    this.registerInstallWithGit();
  }

  private registerUninstallCommand(): void {
    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.unstall.binary', async (onlyGetName: boolean = false) => {
      const title: string = 'Input binary names which will be unstalled';
      const input: string = await this.getContentByInputBox(InstallArgsCollection.UNINSTALL_BINARY, title);
      if (onlyGetName || !Utility.checkIsValid(input)) {
        return input;
      }
      TerminalHelper.execCommand(`${InstallArgsCollection.UNINSTALL_BINARY} ${input}`);
      return '';
    }));

    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.unstall.root', async () => {
      const title: string = 'Input custom directory path where binary be uninstalled.';
      const placeHolder: string = 'Default path: $HOME/.cjpm on Linux/MacOs, %USERPROFILE%/.cjpm on Windows';
      const inputUninstallPath: string = await this.getContentByInputBox(InstallArgsCollection.UNINSTALL_WITH_ROOT, title, placeHolder);
      const inputBinary: string = await vscode.commands.executeCommand('cangjie.unstall.binary', true);
      if (!Utility.checkIsValid(inputBinary)) {
        return;
      }
      if (!Utility.checkIsValid(inputUninstallPath)) {
        TerminalHelper.execCommand(`${InstallArgsCollection.UNINSTALL_BINARY} ${inputBinary}`);
        return;
      }
      TerminalHelper.execCommand(`${InstallArgsCollection.UNINSTALL_WITH_ROOT} ${inputUninstallPath} ${inputBinary}`);
    }));
  }

  private async getContentByInputBox(cmd: string, title: string, placeHolder?: string): Promise<string> {
    const finalTitle: string = `To execute '${cmd}' command, ${title}`;
    const input: string = await vscode.window.showInputBox({
      title: finalTitle,
      placeHolder: placeHolder ?? title,
      ignoreFocusOut: true});
    if (!Utility.checkIsValid(input)) {
      vscode.window.showWarningMessage('Please input the required value');
    }
    return input;
  }

  private registerInstallWithCustonParameter(): void {
    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.customParameter', async () => {
      const inputParameter: string = <string>vscode.workspace.getConfiguration('Cangjie.CjpmInstall').get('Custom');
      TerminalHelper.execCommand(`${InstallArgsCollection.INSTALL_WITH_CUSTOM_PARAMETER} ${inputParameter}`);
    }));
  }

  private registerInstallWithCustomizedOption(): void {
    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.customizedOption', async () => {
      const optionStr: string = await Utility.getCustomizedOptions();
      if (!Utility.checkIsValid(optionStr)) {
        return;
      }
      TerminalHelper.execCommand(
        `${InstallArgsCollection.INSTALL_WITH_CUSTOM_PARAMETER} --${[...new Set(optionStr.split(', '))].join(' --')}`);
    }));
  }

  private registerInstallWithGit(): void {
    this.context.subscriptions.push(vscode.commands.registerCommand('cangjie.install.git', async () => {
      const state = {} as Partial<State>;
      await MultiStepChoose.run(
        (step) => <Thenable<void | InputStep>> this.getGitInformation(step, state));
      if (!Utility.checkIsValid(state.extraPickedParams)) {
        vscode.window.showWarningMessage('Please input the required value');
        return;
      }
      TerminalHelper.execCommand(`${InstallArgsCollection.INSTALL_WITH_GIT} ${state.extraPickedParams}`);
    }));
  }

  private async getGitInformation(step: MultiStepChoose, state: Partial<State>): Promise<(curPick: MultiStepChoose) => Promise<unknown>> {
    const info: string = 'Input target git url';
    const inputBoxOptions: vscode.InputBoxOptions = {
      title: `To execute '${InstallArgsCollection.INSTALL_WITH_GIT}' command, ${info}`,
      placeHolder: info,
      ignoreFocusOut: true,
    };
    const inputGit: string = <string> await step.showEnterInput({inputBoxOptions});
    if (!Utility.checkIsValid(inputGit)) {
      vscode.window.showWarningMessage('Please input the required value');
      return () => Promise.resolve();
    }
    state.extraPickedParams = inputGit;
    return (curStep: MultiStepChoose) => this.pickDetailedGitInfo(curStep, state);
  }

  private async pickDetailedGitInfo(pick: MultiStepChoose, state: Partial<State>): Promise<unknown> {
    const pickItemsContent: PickItemStruct[] = [
      {label: 'default', target: 'default'},
      {label: 'cjpm install --branch <value>', target: '--branch', description: 'Input detailed branch information.'},
      {label: 'cjpm install --tag <value>', target: '--tag', description: 'Input detailed tag information.'},
      {label: 'cjpm install --commit <value>', target: '--commit', description: 'Input detailed commit information.'},
    ];
    const title: string = 'choose one git option';
    const option: PickItemStruct = <PickItemStruct> await pick.showStepPick({
      title,
      placeholder: title,
      items: pickItemsContent,
      canPickMany: false,
      button: [vscode.QuickInputButtons.Back],
    });
    if (!Utility.checkIsValid(option) || option.target === 'default') {
      return () => Promise.resolve();
    }
    return (curStep: MultiStepChoose) => this.inputDetailedGitInfo(curStep, state, option);
  }

  private async inputDetailedGitInfo(pick: MultiStepChoose, state: Partial<State>, option: PickItemStruct): Promise<unknown> {
    if (!Utility.checkIsValid(option)) {
      return () => Promise.resolve();
    }
    const inputBoxOptions: vscode.InputBoxOptions = {
      title: option.description,
      prompt: option.description,
      value: '',
      ignoreFocusOut: true,
    };
    const detail = await pick.showEnterInput({
      inputBoxOptions,
      button: [vscode.QuickInputButtons.Back],
    });
    if (!Utility.checkIsValid(detail)) {
      return () => Promise.resolve();
    }
    state.extraPickedParams = `${state.extraPickedParams} ${option.target} ${detail}`;
    return () => Promise.resolve();
  }
}