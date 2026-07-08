/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {EventListener, Event} from './event/event';
import type {RequestResponseType, Response, Request} from './request/request-response-type';
import type {MessageType} from '../types';
import type * as vscode from 'vscode';
import {RequestHandler} from "./request/request-handler";

type AnyPromiseResolve = (value: (any | PromiseLike<any>)) => void;
type AnyPromiseReject = (reason?: any) => void;

export abstract class MessageManager {
  private readonly eventListeners: Map<string, Array<EventListener<any>>> = new Map();

  private curReqId: number = 0;

  private readonly pendingRequests: Map<number, [AnyPromiseResolve, AnyPromiseReject]> = new Map();

  private readonly requestHandlers: Map<string, RequestHandler<any, any>> = new Map();

  public init(): void {
    this.listenRawMessage(msg => {
      let msgBody = JSON.parse(msg);
      let msgType = msgBody.type as MessageType;
      switch (msgType) {
        case 'event': {
          let eventMsg = msgBody as Event<any>;
          let listeners = this.eventListeners.get(eventMsg.command);
          if (listeners !== undefined) {
            listeners.forEach(l => l.onEventCallback(eventMsg.body));
          }
          break;
        }
        case 'request': {
          let requestMsg = msgBody as Request<any>;
          let handler = this.requestHandlers.get(requestMsg.command)!;
          let promise = handler.handler(requestMsg.body);
          promise.then(value => {
            let successResp = handler.type.createSuccessResponse(value, requestMsg.id);
            this.sendRawMessage(JSON.stringify(successResp));
          }).catch(reason => {
            let errorResp = handler.type.createErrorResponse(`${reason}`, requestMsg.id);
            this.sendRawMessage(JSON.stringify(errorResp));
          });
          break;
        }
        case 'response': {
          let responseMsg = msgBody as Response<any>;
          let resolveReject = this.pendingRequests.get(responseMsg.id);
          if (responseMsg.success) {
            resolveReject[0](responseMsg.body);
          } else {
            resolveReject[1](responseMsg.errMessage);
          }
          break;
        }
        default:
          break;
      }
    });
  }

  public sendEvent<T>(event: Event<T>): string | undefined {
    return this.sendRawMessage(JSON.stringify(event));
  }

  public registerEventListener<T>(listener: EventListener<T>): void {
    if (!this.eventListeners.has(listener.eventType.command)) {
      this.eventListeners.set(listener.eventType.command, []);
    }
    this.eventListeners.get(listener.eventType.command).push(listener);
  }

  public async sendRequest<REQ_BODY, RESP_BODY>(requestType: RequestResponseType<REQ_BODY, RESP_BODY>,
    reqBody: REQ_BODY): Promise<RESP_BODY> {
    let request = requestType.createRequest(reqBody, this.curReqId++);
    let {id} = request;
    let promise = new Promise<RESP_BODY>((resolve, reject) => this.pendingRequests.set(id, [resolve, reject]));
    // put timeout to parameter
    const timeOutMilliseconds = 5000;
    let timeout = new Promise<RESP_BODY>(
      (resolve, reject) => setTimeout(() => reject(`${requestType.command} timeout after 5000ms`),
        timeOutMilliseconds));
    let combined = Promise.race([promise, timeout]);
    // handle send raw result
    this.sendRawMessage(JSON.stringify(request));
    return combined;
  }

  public handleRequest<REQ_BODY, RESP_BODY>(handler: RequestHandler<REQ_BODY, RESP_BODY>): void {
    this.requestHandlers.set(handler.type.command, handler);
  }

  protected abstract sendRawMessage(msg: string): string | undefined;

  protected abstract listenRawMessage(listener: (msg: string) => void): void;
}

export class WebviewMessageManager extends MessageManager {
  private readonly webview: vscode.Webview;

  constructor(webview: vscode.Webview) {
    super();
    this.webview = webview;
  }

  protected listenRawMessage(listener: (msg: string) => void): void {
    this.webview.onDidReceiveMessage(listener);
  }

  protected sendRawMessage(msg: string): string | undefined {
    this.webview.postMessage(msg);
    // to_do handle thenable?
    return undefined;
  }
}