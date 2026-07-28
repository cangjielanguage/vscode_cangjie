/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

export const DATE_TIME_REGEX =
  /^(?<date>\d{4}-\d{2}-\d{2})?[T\s]?(?:(?<hour>\d{2}):\d{2}:\d{2}(?:.\d+)?)?(?<timezone>Z|[-+]\d{2}:\d{2})?$/i;

export const INT_REGEX =
  /^(?<integer>(?<hex>0x[0-9a-fA-F](?:_?[0-9a-fA-F])*)|(?<nonHex>(?<prefix>[+-]|0[ob])?\d(?:_?\d)*))$/;

export const FLOAT_REGEX = /^[+-]?\d(?:_?\d)*(?<decimal>\.\d(?:_?\d)*)?(?<exponent>[eE][+-]?\d(?:_?\d)*)?$/;

export const LEADING_ZERO_REGEX = /^[+-]?0[0-9_]/;

export const ESCAPE_REGEX = /^[0-9a-f]{4,8}$/i;

export const KEY_REGEX = /^[a-z0-9-_]+$/i;

export const LINE_SPLITTER_REGEX = /\r\n|\n|\r/g;

export const KEY_PART_REGEX = /^[a-zA-Z0-9-_]+[\s\t]*$/;

export const DATE_HOURS_INDEX = 2;

export const DATE_MAX_HOURS = 23;

export const DATE_OFFSET_INDEX = 3;

export const DATE_END_INDEX = 10;

export const TIME_START_INDEX = 11;

export const TIME_END_INDEX = 23;

export const HOUR_MINUTES_SECONDS = 60;

export const MILL_SECONDS = 1000;

export const MINUTE_START_INDEX = 4;

export const MINUTE_END_INDEX = 6;

export const TWO_POS_OFFSET = 2;

export const LOWER_CHARACTER_LENGTH = 4;

export const UPPER_CHARACTER_LENGTH = 8;

export const ESCAPE_SYMBOL_MAP = {
  b: '\b',
  t: '\t',
  n: '\n',
  f: '\f',
  r: '\r',
  '"': '"',
  '\\': '\\',
};