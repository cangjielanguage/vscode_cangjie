// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import {MessageType} from '../../utils/Types';

export interface Event<BODY> {
  command: string;
  type: MessageType;
  body: BODY;
}

export class EventType<BODY> {
  command: string;

  constructor(command: string) {
    this.command = command;
  }

  public createEvent(t: BODY): Event<BODY> {
    return {
      body: t, command: this.command, type: 'event',
    };
  }
}

export class EventListener<BODY> {
  eventType: EventType<BODY>;
  onEventCallback: (t: BODY) => void;

  constructor(eventType: EventType<BODY>, onEventCallback: (t: BODY) => void) {
    this.eventType = eventType;
    this.onEventCallback = onEventCallback;
  }
}
