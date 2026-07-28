/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {
  DATE_HOURS_INDEX,
  DATE_END_INDEX,
  DATE_MAX_HOURS,
  DATE_OFFSET_INDEX,
  DATE_TIME_REGEX,
  TIME_END_INDEX, TIME_START_INDEX, HOUR_MINUTES_SECONDS, MINUTE_START_INDEX, MINUTE_END_INDEX, MILL_SECONDS
} from './toml-constants';
import {isEmpty} from './toml-util';

export default class CustomTomlDate extends Date {
  protected includeDate = false;
  protected includeTime = false;
  protected dateOffset: string | null = null;

  constructor(date: string | Date, includeDate = true, includeTime = true,
    dateOffset: string | null = 'Z') {
    super(date);
    if (!isNaN(this.getTime())) {
      this.includeDate = includeDate;
      this.includeTime = includeTime;
      this.dateOffset = dateOffset;
    }
  }

  static createCustomTomlDate(dateParam: string | Date): CustomTomlDate {
    let date = dateParam;
    if (typeof date !== 'string') {
      return new CustomTomlDate(date);
    }
    let includeDate = true;
    let includeTime = true;
    let dateOffset: string | null = 'Z';
    const match = date.match(DATE_TIME_REGEX);
    if (match !== undefined && match !== null && match.length > 0) {
      if (isEmpty(match[1])) {
        includeDate = false;
        date = `0000-01-01T${date}`;
      }
      includeTime = Boolean(match[DATE_HOURS_INDEX]);
      if (!isEmpty(match[DATE_HOURS_INDEX]) && +Number(match[DATE_HOURS_INDEX]) > DATE_MAX_HOURS) {
        date = '';
      } else {
        dateOffset = match[DATE_OFFSET_INDEX] || null;
        date = date.toUpperCase();
        if (dateOffset === undefined || dateOffset === null || dateOffset === '') {
          date += 'Z';
        }
      }
    } else {
      date = '';
    }
    return new CustomTomlDate(date, includeDate, includeTime, dateOffset);
  }

  isDate(): boolean {
    return this.includeDate && !this.includeTime;
  }

  isTime(): boolean {
    return this.includeTime && !this.includeDate;
  }

  isValid(): boolean {
    return this.includeDate || this.includeTime;
  }

  toISOString(): string {
    const iso = super.toISOString();

    // Local Date
    if (this.isDate()) {
      return iso.slice(0, DATE_END_INDEX);
    }

    // Local Time
    if (this.isTime()) {
      return iso.slice(TIME_START_INDEX, TIME_END_INDEX);
    }

    // Local DateTime
    if (this.dateOffset === null) {
      return iso.slice(0, -1);
    }

    // Offset DateTime
    if (this.dateOffset === 'Z') {
      return iso;
    }

    let offset = (+Number(this.dateOffset.slice(1, DATE_OFFSET_INDEX)) * HOUR_MINUTES_SECONDS) +
      +Number(this.dateOffset.slice(MINUTE_START_INDEX, MINUTE_END_INDEX));
    offset = this.dateOffset[0] === '-' ? offset : -offset;

    const offsetDate = new Date(this.getTime() - (offset * HOUR_MINUTES_SECONDS * MILL_SECONDS));
    return offsetDate.toISOString().slice(0, -1) + this.dateOffset;
  }
}