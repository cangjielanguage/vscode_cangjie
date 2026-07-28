/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {MessageType} from '../../types';

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

export const ThemeChangedType: EventType<boolean> = new EventType<boolean>('ThemeChanged');

export type RecordProps = {
  dateTimeStamp: number;

  id: number;

  threadId: number;

  threadName: string;

  type: string;
};

export const AllRecordsType = new EventType<RecordProps[]>('AllRecords');

export type StoppedProps = {
  recordId: number;
};

export const StoppedType = new EventType<StoppedProps>('Stopped');

export type RecordsChangedProps = {
  newRecords: RecordProps[];
  removedRecordIds: number[] | undefined;
};
export const RecordsChangedType = new EventType<RecordsChangedProps>('RecordsChanged');

export const GotoNextRecordType = new EventType<undefined>('GotoNextRecord');

export const GotoPrevRecordType = new EventType<undefined>('GotoPrevRecord');

export const ShowErrorMessageType = new EventType<string>('ShowErrorMessage');