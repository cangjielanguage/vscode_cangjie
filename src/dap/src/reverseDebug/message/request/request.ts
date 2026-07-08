/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {
  GotoRecordPointProps,
  RecordMessageProps,
  RecordMessageResponseProps,
  TimeLineRootProps
} from '../../types';
import {RequestResponseType} from "./request-response-type";

export const TimelinePropsRequestType =
  new RequestResponseType<undefined, TimeLineRootProps>('TimelineProps');

export const GotoRecordPointRequestType =
  new RequestResponseType<GotoRecordPointProps, undefined>('GotoRecordPoint');

export const RecordMessageRequestType =
  new RequestResponseType<RecordMessageProps, RecordMessageResponseProps>('RecordMessage');