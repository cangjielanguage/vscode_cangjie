// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import {createContext} from 'react';
import Konva from 'konva';

export const MouseMoveHandlers = createContext<Set<(evt: Konva.KonvaEventObject<MouseEvent>) => void>>(new Set());
export const MouseUpHandlers = createContext<Set<(evt: Konva.KonvaEventObject<MouseEvent>) => void>>(new Set());
export const MouseLeaveHandlers = createContext<Set<(evt: Konva.KonvaEventObject<MouseEvent>) => void>>(new Set());
export const IsThemeDark = createContext(true);
export const SelectedRecordId = createContext<number | undefined>(undefined);
