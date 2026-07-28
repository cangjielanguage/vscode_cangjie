/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

export interface RequiresTreeMessage {
  command: string;
  requireType: string;
  requireName: string;
  requireLibs: object;
  uri: string;
}

export interface ConfigSetMessage {
  command: string;
  field: string;
  key: string;
  value: string | PkgValue;
  oldValue: string;
  singleCnd: string;
}

interface PkgValue {
  output_type: string;
  command: string;
  condition: string;
  configuration: string;
  condition_option: string;
}