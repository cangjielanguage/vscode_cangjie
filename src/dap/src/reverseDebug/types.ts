/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {RecordProps} from './message/event/event';

export type MessageType = 'event' | 'request' | 'response';

export type TimeLineRootProps = {
  isThemeDark: boolean;
  initialRecords: RecordProps[];
};

export type GotoRecordPointProps = {
  recordPointId: number;
};

export type RecordMessageProps = {
  recordPointIds: number[];

  requireThread?: boolean;

  requireStackFrame?: boolean;

  requireLocalVariables?: boolean;

  requireGlobalVariables?: boolean;

  requireStaticVariables?: boolean;

  monitorVariables?: MonitorVariable[];
};

export type MonitorVariable = {
  id: number;

  name?: string;

  scopeName?: string;

  type?: string;

  value?: string;
};

export type MessageProps = {
  recordPointId: number;

  threadId?: number;

  sourcePath?: string;

  line?: number;

  monitorVariables?: MonitorVariable[];
};

export type RecordMessageResponseProps = {
  recordMessages: MessageProps[];
};