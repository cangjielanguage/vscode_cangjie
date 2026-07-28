/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import type {Disposable, Webview, WebviewOptions, WebviewPanelOptions} from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {checkFieldNotEmpty, createDisposable, getExtensionPath, getExtensionUri, isEmpty, sendRequest} from '../common-utils';
import {WebviewMessageManager} from './message/message-manager';
import {
  GotoRecordPointRequestType,
  RecordMessageRequestType,
  TimelinePropsRequestType
} from './message/request/request';
import type {
  GotoRecordPointProps,
  MessageProps,
  RecordMessageProps,
  RecordMessageResponseProps,
  TimeLineRootProps
} from './types';
import {addThemeChangedListener, isCurThemeDark} from './theme-utils';
import {
  AllRecordsType, EventListener,
  GotoNextRecordType,
  GotoPrevRecordType,
  RecordsChangedType, ShowErrorMessageType,
  StoppedType,
  ThemeChangedType
} from './message/event/event';
import type {RecordProps} from './message/event/event';
import {CangjieSocketDebugAdapter} from '../cangjie-socket-debug-adapter';
import {CangjieReverseDebug} from './cangjie-reverse-debug';
import {RequestHandler} from "./message/request/request-handler";

export class TimelineWebView {
  private static readonly bodyTag = '<body>';

  private static readonly ideTypeScript: string = '<script>let ideType = "VSCode"</script>';

  private static readonly maxCoroutineNums:number = 6000000000;

  private readonly webview: vscode.Webview;

  private readonly messageManager: WebviewMessageManager;

  private disposables: Disposable[] = [];

  private startingRecordTimestamp = 0;

  private isSupportKeySelectRecord = false;

  constructor(webview: Webview) {
    this.webview = webview;
    this.messageManager = new WebviewMessageManager(webview);
    this.messageManager.init();
    this.initWebviewRequestHandlers();
    this.initWebviewEventListeners();
    this.initVSCodeListeners();
    if (CangjieSocketDebugAdapter.INSTANCE !== undefined) {
      CangjieSocketDebugAdapter.INSTANCE.addDisposable(
        createDisposable(() => this.messageManager.sendEvent(AllRecordsType.createEvent([]))));
      this.initDapMessageListeners(CangjieSocketDebugAdapter.INSTANCE);
    }
    this.disposables.push(CangjieSocketDebugAdapter.addInstanceCreatedCallback(adapter => {
      this.startingRecordTimestamp = 0;
      adapter.addDisposable(createDisposable(() => this.messageManager.sendEvent(AllRecordsType.createEvent([]))));
      this.initDapMessageListeners(adapter);
    }));
  }

  public static getWebviewOptions(): WebviewPanelOptions & WebviewOptions {
    return {
      retainContextWhenHidden: true,
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(getExtensionUri(), 'webview')],
    };
  }

  private static createRecordMsgFromDapRecordMsg(recordMessages: any[]): MessageProps[] {
    let messageProps: MessageProps[] = [];
    if (recordMessages === null) {
      return messageProps;
    }
    for (let i = 0; i < recordMessages.length; i++) {
      let recordMessage = recordMessages[i];
      let props: MessageProps = {
        recordPointId: recordMessage.recordPointId,
        monitorVariables: recordMessage.monitorVariables,
      };
      if (recordMessage.thread !== undefined) {
        props.threadId = recordMessage.thread.id;
      }
      if (recordMessage.stackFrame !== undefined) {
        props.line = recordMessage.stackFrame.line;
        props.sourcePath = recordMessage.stackFrame.source.path;
      }
      messageProps.push(props);
    }
    return messageProps;
  }

  private static getRecordType(type: string): string {
    let memo: string = '';
    for (let i = 0; i < type.length; i++) {
      if (i === 0) {
        memo += type[i].toLocaleUpperCase();
      } else if (type[i] === type[i].toUpperCase()) {
        memo += ` ${type[i].toLocaleUpperCase()}`;
      } else {
        memo += type[i];
      }
    }
    return memo.toString();
  }

  private static updateRecordPoints(recordPoints: any): void {
    if (recordPoints !== undefined && recordPoints !== null) {
      for (let i = 0; i < recordPoints.length; i++) {
        if (!isEmpty(recordPoints[i].coroutineId) && recordPoints[i].coroutineId !== -1) {
          recordPoints[i].threadId = recordPoints[i].coroutineId;
          recordPoints[i].threadName = `CJthread ${recordPoints[i].coroutineId}`;
        } else {
          recordPoints[i].threadId = recordPoints[i].threadId + TimelineWebView.maxCoroutineNums;
        }
      }
    }
  }

  public initHtml(): void {
    const indexPath = path.join(getExtensionPath(), 'webview', 'timeline', 'index.html');
    let html = fs.readFileSync(indexPath).toString();
    let splitBySpace = html.split(' ');
    for (let i = 0; i < splitBySpace.length; i++) {
      let split = splitBySpace[i];
      let searchIdx = split.indexOf('static');
      if (searchIdx >= 0) {
        let lastQuoteIdx = split.lastIndexOf('"');
        let relPath = split.substring(searchIdx, lastQuoteIdx);
        let relPathSplitBySlash = relPath.split('/');
        let uri = this.webview.asWebviewUri(vscode.Uri.joinPath(getExtensionUri(), 'webview', 'timeline', ...relPathSplitBySlash));
        let equalsIdx = split.indexOf('=');
        let prefix = split.substring(0, equalsIdx + 1);
        splitBySpace[i] = `${prefix}"${uri.toString()}${split.substring(lastQuoteIdx)}`;
      }
    }
    html = splitBySpace.join(' ');
    let bodyTagIdx = html.indexOf(TimelineWebView.bodyTag);
    html = html.substring(0, bodyTagIdx) + TimelineWebView.bodyTag + TimelineWebView.ideTypeScript +
      html.substring(bodyTagIdx + TimelineWebView.bodyTag.length);
    this.webview.html = html;
  }

  public dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }

  private initDapMessageListeners(adapter: CangjieSocketDebugAdapter): void {
    this.disposables.push(adapter.addMessageListener('event', 'stopped', msg => {
      let recordId = (msg as any).body.recordPointId;
      if (recordId !== undefined) {
        let props = {recordId: recordId};
        this.messageManager.sendEvent(StoppedType.createEvent(props));
      }
    }));
    this.disposables.push(adapter.addMessageListener('event', 'recordPointsUpdate', msg => {
      let recordPoints = (msg as any).body.newRecordPoints;
      TimelineWebView.updateRecordPoints(recordPoints);
      let newRecords = this.createRecordPropsFromDapRecords(recordPoints);
      let removedRecordIds = (msg as any).body.removedRecordPointIds;
      this.messageManager.sendEvent(
        RecordsChangedType.createEvent({newRecords: newRecords, removedRecordIds: removedRecordIds}));
    }));
  }

  private createRecordPropsFromDapRecords(recordPoints: any[]): RecordProps[] {
    let recordProps: RecordProps[] = [];
    for (let i = 0; i < recordPoints.length; i++) {
      if (this.startingRecordTimestamp === 0 && i === 0) {
        this.startingRecordTimestamp = recordPoints[i].timeStamp;
      }
      let props: RecordProps = {
        dateTimeStamp: recordPoints[i].timeStamp - this.startingRecordTimestamp,
        id: recordPoints[i].id,
        threadId: recordPoints[i].threadId,
        threadName: recordPoints[i].threadName,
        type: TimelineWebView.getRecordType(recordPoints[i].type),
      };
      recordProps.push(props);
    }
    return recordProps;
  }

  private initWebviewRequestHandlers(): void {
    this.messageManager.handleRequest(new RequestHandler(TimelinePropsRequestType, async _ => {
      let records: RecordProps[] = [];
      if (CangjieSocketDebugAdapter.INSTANCE !== undefined && vscode.debug.activeDebugSession) {
        let body = await sendRequest('recordPoints');
        let recordPoints = body.recordPoints;
        TimelineWebView.updateRecordPoints(recordPoints);
        records = this.createRecordPropsFromDapRecords(recordPoints);
      }
      let props: TimeLineRootProps = {
        isThemeDark: isCurThemeDark(),
        initialRecords: records,
      };
      return props;
    }));
    this.messageManager.handleRequest(
      new RequestHandler<GotoRecordPointProps, undefined>(GotoRecordPointRequestType, async handler => {
        if (!CangjieReverseDebug.instance.isCangjieReverseDebugMode) {
          throw new Error('unsupported in normal debug mode');
        } else {
          await sendRequest('gotoRecordPoint', handler);
        }
        return undefined;
      }));
    this.messageManager.handleRequest(
      new RequestHandler<RecordMessageProps, RecordMessageResponseProps>(RecordMessageRequestType, async handler => {
        let recordMessages: MessageProps[] = [];
        let body = await sendRequest('recordMessage', handler);
        recordMessages = TimelineWebView.createRecordMsgFromDapRecordMsg(body.recordMessages);
        let props: RecordMessageResponseProps = {
          recordMessages: recordMessages,
        };
        return props;
      }));
  }

  private initWebviewEventListeners(): void {
    this.messageManager.registerEventListener(new EventListener(ShowErrorMessageType, reason => {
      if (checkFieldNotEmpty(reason) && reason.startsWith('Error: ')) {
        reason = reason.substring(7);
      }
      vscode.window.showErrorMessage(reason);
    }));
  }

  private initVSCodeListeners(): void {
    this.disposables.push(
      addThemeChangedListener(isDark => this.messageManager.sendEvent(ThemeChangedType.createEvent(isDark))));
    if (this.isSupportKeySelectRecord) {
      this.disposables.push(vscode.commands.registerCommand('timeline.nextRecord', async () => {
        this.messageManager.sendEvent(GotoNextRecordType.createEvent(undefined));
      }));
      this.disposables.push(vscode.commands.registerCommand('timeline.prevRecord', async () => {
        this.messageManager.sendEvent(GotoPrevRecordType.createEvent(undefined));
      }));
    }
  }
}