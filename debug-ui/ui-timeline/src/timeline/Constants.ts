// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import {TimelineRootProps} from './TimelineRoot';

export const RECORD_POINTS_LINE_SPACING = 30;

export const TIMELINE_STAGE_BORDER_WIDTH = 50;

export const MAIN_TIMELINE_STAGE_HEIGHT = 50;

export const RECORD_ICON_RADIUS = 5;

export const NO_TIME_UNIT = true;

export const TEXT_FONT_COLOR_DARK_THEME = '#CCCCCC';

export const RECORD_TOOLTIP_FONT_COLOR_LIGHT_THEME = '#616161';

export const RECORD_TOOLTIP_BACKGROUND_DARK_THEME = '#3C3C3C';

export const RECORD_TOOLTIP_BACKGROUND_LIGHT_THEME = '#f5f4f4';

export const RECORD_TOOLTIP_STROKE_COLOR = '#919191';

export const TEXT_FONT_FAMILY = 'Segoe WPC,Segoe UI,sans-serif';

export const StandaloneTimelineProps: TimelineRootProps = {
  initialThemeDark: true,
  initialRecords: [
    {
      dateTimeStamp: 0,
      id: 0,
      threadId: 8,
      threadName: 'Application_application_thread',
      type: 'Step',
    },
    {
      dateTimeStamp: 100,
      id: 1,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Pause',
    },
    {
      dateTimeStamp: 400,
      id: 2,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Pause',
    },
    {
      dateTimeStamp: 450,
      id: 3,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Breakpoint',
    },
    {
      dateTimeStamp: 800,
      id: 4,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Instruction Breakpoint',
    },
    {
      dateTimeStamp: 1111,
      id: 5,
      threadId: 3,
      threadName: 'Thread3',
      type: 'Function Breakpoint',
    },
    {
      dateTimeStamp: 1150,
      id: 6,
      threadId: 5,
      threadName: 'Thread5',
      type: 'Step',
    },
    {
      dateTimeStamp: 1130,
      id: 7,
      threadId: 2,
      threadName: 'Thread-hello',
      type: 'Breakpoint',
    },
    {
      dateTimeStamp: 1140,
      id: 8,
      threadId: 2,
      threadName: 'Thread-hello',
      type: 'Exception Breakpoint',
    },
    {
      dateTimeStamp: 1340,
      id: 9,
      threadId: 3,
      threadName: 'Thread-hello',
      type: 'Data Breakpoint',
    },
    {
      dateTimeStamp: 1350,
      id: 10,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Breakpoint',
    },
    {
      dateTimeStamp: 1360,
      id: 11,
      threadId: 3,
      threadName: 'Thread-hello',
      type: 'Step',
    },
    {
      dateTimeStamp: 1500,
      id: 12,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Enum',
    },
    {
      dateTimeStamp: 1600,
      id: 13,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Pause',
    },
    {
      dateTimeStamp: 1800,
      id: 14,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Pause',
    },
    {
      dateTimeStamp: 1890,
      id: 15,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Pause',
    },
    {
      dateTimeStamp: 1990,
      id: 16,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Pause',
    },
    {
      dateTimeStamp: 1960,
      id: 17,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Pause',
    },
    {
      dateTimeStamp: 2000,
      id: 18,
      threadId: 1,
      threadName: 'Thread1',
      type: 'Pause',
    },
  ],
};
