/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import {CangjieDebugConfigurationProvider} from './cangjie-debug-configuration-provider';
import {CangjieDebugAdapterDescriptorFactory} from './cangjie-debug-adapter-descriptor-factory';
import {DapMessageTrackerFactory} from './dap-message-tracker-factory';
import {CangjieBuildTaskProvider} from './cangjie-build-task-provider';
import type {OutputChannel} from 'vscode';
import {cjpmTomlName, debugType} from './constants';
import {
  CangjieDebugConfigurationSnippetProvider,
  launchJsonCompletionFinishedCallback
} from './cangjie-debug-configuration-snippet-provider';
import * as vSCodeCommands from './command';
import {cangjieBuildType} from './task-utils';
import {buildAndDebugSingleFile, buildAndDebugSingleFileByCjVM} from './build-utils';
import {
  setExtensionPath, setExtensionUri,
  setOutputChannel
} from './common-utils';
import {CangjieReverseDebug} from './reverseDebug/cangjie-reverse-debug';
import type {WebviewViewProvider} from 'vscode';
import {TimelineWebviewViewProvider} from './reverseDebug/view-provider';
import {resetReverseSettingName} from './reverseDebug/reverse-debug-config-property';
import {debugTest, runTest} from './ut/exec-command';
import {debugCodeCommand} from "./command";
import {CangjieDependency} from "./config/cangjie-dependency";

export async function activate(context: vscode.ExtensionContext, outputChannel: OutputChannel): Promise<void> {
  setExtensionPath(context.extensionPath);
  setExtensionUri(context.extensionUri);
  setOutputChannel(outputChannel);
  const launchJsonDocumentSelector: vscode.DocumentSelector = [{
    scheme: 'file',
    language: 'jsonc',
    pattern: '**/launch.json',
  }];
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(launchJsonDocumentSelector,
    new CangjieDebugConfigurationSnippetProvider()));
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider(debugType, new CangjieDebugConfigurationProvider()));
  context.subscriptions.push(
    vscode.debug.registerDebugAdapterTrackerFactory(debugType, new DapMessageTrackerFactory(outputChannel)));
  const debugServerAdaptorFactory = new CangjieDebugAdapterDescriptorFactory();
  context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory(debugType, debugServerAdaptorFactory));
  context.subscriptions.push(
    vscode.debug.onDidTerminateDebugSession(() => debugServerAdaptorFactory.sessionTerminated()));
  context.subscriptions.push(vscode.commands.registerCommand(vSCodeCommands.launchJsonCompletionFinishedCallback,
    launchJsonCompletionFinishedCallback));
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.buildAndDebugCurrentFile, buildAndDebugSingleFile));
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.openReverseMode, CangjieReverseDebug.openReverseMode));
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.closeReverseMode, CangjieReverseDebug.closeReverseMode));
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.reverseStep, CangjieReverseDebug.reverseStep));
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.stepInReverse, CangjieReverseDebug.stepInReverse));
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.continueInReverse, CangjieReverseDebug.continueInReverse));
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.reverseContinue, CangjieReverseDebug.reverseContinue));
  context.subscriptions.push(vscode.tasks.registerTaskProvider(cangjieBuildType, new CangjieBuildTaskProvider()));
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.buildAndDebugCurrentFileByCjVM, buildAndDebugSingleFileByCjVM));
  registerTimeline(context);
  registerDebugCodeHandlers(context);
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.folderReverseBreakpoint, CangjieReverseDebug.addFolderReverseBreakpoints));
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.fileReverseBreakpoint, CangjieReverseDebug.addFileReverseBreakpoints));
  context.subscriptions.push(
    vscode.commands.registerCommand(vSCodeCommands.lineReverseBreakpoint, CangjieReverseDebug.addLineReverseBreakpoint));
  resetReverseSettingName();
  context.subscriptions.push(vscode.commands.registerCommand(vSCodeCommands.runUnitTest, runTest));
  context.subscriptions.push(vscode.commands.registerCommand(vSCodeCommands.debugUnitTest, debugTest));
}


function registerTimeline(context: vscode.ExtensionContext): void {
  let provider: WebviewViewProvider = new TimelineWebviewViewProvider();
  context.subscriptions.push(vscode.window.registerWebviewViewProvider('cangjie-debug-timeline', provider, {
    webviewOptions: {
      retainContextWhenHidden: true,
    },
  }));
}

export function registerDebugCodeHandlers(context: vscode.ExtensionContext): void {
  context.subscriptions.push(vscode.commands.registerCommand(debugCodeCommand, async () => {
    await vscode.workspace.saveAll(false);
    let folder = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);
    await CangjieDebugConfigurationProvider.createDebugConfigurationAsync(folder, false, true);
  }));
  CangjieDependency.isExecutable().then(e => {
    vscode.commands.executeCommand('setContext', 'cangjie.debug.state', e);
  });
  registerCjpmTomlModifyWatcher();
}

function registerCjpmTomlModifyWatcher() {
  let lastValidatedContent = '';
  let validationPending = false;
  let validationTimeout = null;
  vscode.workspace.onDidSaveTextDocument(document => {
    if (document.fileName.endsWith(cjpmTomlName) && !validationPending) {
      if (document.getText() !== lastValidatedContent) {
        validationPending = true;
        if (validationTimeout) {
          clearTimeout(validationTimeout);
        }
        validationTimeout = setTimeout(() => {
          CangjieDependency.isExecutable().then(e => {
            vscode.commands.executeCommand('setContext', 'cangjie.debug.state', e);
          });
          validationPending = false;
        }, 100);
      }
    }
  });
}