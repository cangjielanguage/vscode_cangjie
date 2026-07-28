/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {ShellExecution, Task} from './vscode';
import {serverPortArgPrefix} from '../constants';
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';

export let dapServer: net.Server;
export let protocolRequestMap = new Map();
export let protocolResponseMap = new Map();

const TWO_CRLF = '\r\n\r\n';
const HEADER_LINE_SEPARATOR = /\r?\n/;
const HEADER_FIELD_SEPARATOR = /: */;

export function mockDapServer(task: Task) {
  if (!isFieldEmpty(task.execution) && task.execution instanceof ShellExecution) {
    const execution = <ShellExecution>task.execution;
    if (typeof execution.command === 'string') {
      const command = <string>execution.command;
      const args = <string[]>execution.args;
      if (!isFieldEmpty(command) && command.includes('dap_server') && !isFieldEmpty(args)) {
        mockRunDapServer(command);
      }
    }
  }
}

function mockRunDapServer(command: string) {
  const match = command.match(/--port=(\d+)/);
  if (match) {
    const portParam = match[1];
    if (!isFieldEmpty(portParam)) {
      const port = parseInt(portParam, 10);
      dapServer = net.createServer(socket => {
        socket.on('data', data => {
          mockServerSendResponse(data, socket);
        });
        socket.on('end', () => {
        });
      });
      dapServer.listen(port, () => {
      });
      const protocolJsonContent = fs.readFileSync(path.join(__dirname, 'requestAndResponse.json'), 'utf8');
      let protocolJsonArr = JSON.parse(protocolJsonContent);
      protocolJsonArr.forEach((item: any) => {
        protocolRequestMap.set(item.request.seq + item.request.command, item.request);
        protocolResponseMap.set(item.request.seq + item.request.command, item.response);
      });
    }
  }
}

function mockServerSendResponse(data: any, socket: net.Socket) {
  if (!isFieldEmpty(data)) {
    const responseJson = protocolResponseMap.get(searchRequestKey(data));
    if (!isFieldEmpty(responseJson)) {
      const response = JSON.stringify(responseJson);
      socket.write(`Content-Length: ${Buffer.byteLength(response, 'utf8')}${TWO_CRLF}${response}`,
        'utf8');
    }
  }
}

function isFieldEmpty(arg: any): boolean {
  return arg === undefined || arg === null;
}

function searchRequestKey(data: Buffer): string {
  let rawData = Buffer.allocUnsafe(0);
  let contentLength = -1;
  rawData = Buffer.concat([rawData, data]);
  while (true) {
    if (contentLength >= 0) {
      if (rawData.length >= contentLength) {
        const message = rawData.toString('utf8', 0, contentLength);
        rawData = rawData.slice(contentLength);
        contentLength = -1;
        const requestMsg = JSON.parse(message);
        return requestMsg.seq + requestMsg.command;
      }
    } else {
      const idx = rawData.indexOf(TWO_CRLF);
      if (idx !== -1) {
        const header = rawData.toString('utf8', 0, idx);
        const lines = header.split(HEADER_LINE_SEPARATOR);
        for (const h of lines) {
          const kvPair = h.split(HEADER_FIELD_SEPARATOR);
          if (kvPair[0] === 'Content-Length') {
            contentLength = Number(kvPair[1]);
          }
        }
        rawData = rawData.slice(idx + TWO_CRLF.length);
        continue;
      }
    }
    break;
  }
  return '';
}

export function mockDapServerDispose() {
  if (!isFieldEmpty(dapServer)) {
    dapServer.close();
  }
  protocolRequestMap.clear();
  protocolResponseMap.clear();
}