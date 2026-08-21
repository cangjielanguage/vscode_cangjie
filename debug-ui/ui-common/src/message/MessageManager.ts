// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import {WebviewApi} from 'vscode-webview';
import {EventListener, Event} from './event/Event';
import {RequestResponseType, Response, Request, RequestHandler} from './request/Request';
import {MessageType} from '../utils/Types';
import {getIdeType} from '../utils/Utils';

type AnyPromiseResolve = (value: (any | PromiseLike<any>)) => void;
type AnyPromiseReject = (reason?: any) => void;

export abstract class MessageManager {
  private static INSTANCE: MessageManager | undefined = undefined;

  private readonly eventListeners: Map<string, EventListener<any>[]> = new Map();

  private curReqId: number = 0;

  private readonly pendingRequests: Map<number, [AnyPromiseResolve, AnyPromiseReject]> = new Map();

  private readonly requestHandlers: Map<string, RequestHandler<any, any>> = new Map();

  public static instance(): MessageManager {
    if (MessageManager.INSTANCE !== undefined) {
      return MessageManager.INSTANCE;
    }
    switch (getIdeType()) {
      case 'VSCode':
        MessageManager.INSTANCE = new VSCodeMessageManager();
        break;
      case 'Standalone':
        MessageManager.INSTANCE = new StandaloneMessageManager();
        break;
      case 'Deveco':
        MessageManager.INSTANCE = DevecoMessageManager.DEVECO_INSTANCE;
        break;
      case 'vNext':
        MessageManager.INSTANCE = new VNextMessageManager();
        break;
      default:
        throw Error('wrong type');
    }
    MessageManager.INSTANCE.init();
    return MessageManager.INSTANCE;
  }

  public sendEvent<T>(event: Event<T>): string | undefined {
    return this.sendRawMessage(JSON.stringify(event));
  }

  public registerEventListener<T>(listener: EventListener<T>): void {
    if (!this.eventListeners.has(listener.eventType.command)) {
      this.eventListeners.set(listener.eventType.command, []);
    }
    let commandListeners = this.eventListeners.get(listener.eventType.command);
    if (commandListeners === undefined || commandListeners === null) {
      return;
    }
    commandListeners.push(listener);
  }

  public async sendRequest<REQ_BODY, RESP_BODY>(requestType: RequestResponseType<REQ_BODY, RESP_BODY>,
                                                reqBody: REQ_BODY, hasTimeout?: boolean ): Promise<RESP_BODY> {
    let request = requestType.createRequest(reqBody, this.curReqId++);
    let id = request.id;
    let combined;
    let promise = new Promise<RESP_BODY>((resolve, reject) => this.pendingRequests.set(id, [resolve, reject]));
    let timeout = new Promise<RESP_BODY>((resolve, reject) =>
        setTimeout((): void => reject(new Error(`${requestType.command} timeout after 10000ms`)), 10000));
    if (hasTimeout) {
      combined = Promise.race([promise, timeout]);
    } else {
      combined = promise;
    }
    this.sendRawMessage(JSON.stringify(request));
    return combined;
  }

  public handleRequest<REQ_BODY, RESP_BODY>(handler: RequestHandler<REQ_BODY, RESP_BODY>): void {
    this.requestHandlers.set(handler.type.command, handler);
  }

  private init(): void {
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
          const handler = this.requestHandlers.get(requestMsg.command);
          if (handler === undefined || handler === null) {
            break;
          }
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
          if (resolveReject === undefined || resolveReject === null) {
            break;
          }
          if (responseMsg.success) {
            resolveReject[0](responseMsg.body);
          } else {
            resolveReject[1](responseMsg.errMessage);
          }
          break;
        }
        default:
          throw Error('wrong type');
      }
    });
  }

  protected abstract sendRawMessage(msg: string): string | undefined;

  protected abstract listenRawMessage(listener: (msg: string) => void): void;
}

class VSCodeMessageManager extends MessageManager {
  private readonly webviewApi: WebviewApi<unknown> = acquireVsCodeApi();

  protected sendRawMessage(msg: string): string | undefined {
    try {
      this.webviewApi.postMessage(msg);
      return undefined;
    } catch (e) {
      return `post msg error ${e}`;
    }
  }

  protected listenRawMessage(listener: (msg: string) => void): void {
    window.addEventListener('message', event => listener(event.data));
  }
}

class StandaloneMessageManager extends MessageManager {
  protected listenRawMessage(listener: (msg: string) => void): void {
    // do nothing
  }

  protected sendRawMessage(msg: string): string | undefined {
    // do nothing
    return undefined;
  }
}

export class DevecoMessageManager extends MessageManager {
  public static readonly DEVECO_INSTANCE: DevecoMessageManager = new DevecoMessageManager();

  public readonly listeners: ((msg: string) => void)[] = [];

  protected listenRawMessage(listener: (msg: string) => void): void {
    this.listeners.push(listener);
  }

  protected sendRawMessage(msg: string): string | undefined {
    (window as any).cefQuery({
      request: msg,
      onSuccess: (response: any) => {

      },
      onFailure: (responseCode: any, failMessage: any) => {

      },
    });
    return undefined;
  }
}

export class VNextMessageManager extends MessageManager {
  protected listenRawMessage(listener: (msg: string) => void): void {
    window.addEventListener('message', event => listener(event.data));
  }

  protected sendRawMessage(msg: string): string | undefined {
    try {
      (window as any).ipc.postMessage(msg);
      return undefined;
    } catch (e) {
      return `post msg error ${e}`;
    }
  }
}
