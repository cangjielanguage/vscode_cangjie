/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {KEY_REGEX} from './toml-constants';
import {type CommentRecord} from './toml-parse';
import {LocationEnum} from './toml-enum';

function getTypeName(obj: unknown): string {
  const type = typeof obj;
  if (type === 'object') {
    if (Array.isArray(obj)) {
      return 'array';
    }
    if (obj instanceof Date) {
      return 'date';
    }
  }
  return type;
}

function isArrayOfTables(obj: unknown[]): boolean {
  for (let i = 0; i < obj.length; i++) {
    if (getTypeName(obj[i]) !== 'object') {
      return false;
    }
  }
  return obj.length !== 0;
}

function formatString(s: string): string {
  return JSON.stringify(s).replace(/\x7f/g, '\\u007f');
}

function stringifyValue(val: any, type: string = getTypeName(val)): string {
  if (type === 'number') {
    if (isNaN(val)) {
      return 'nan';
    }
    if (val === Infinity) {
      return 'inf';
    }
    if (val === -Infinity) {
      return '-inf';
    }
    return val.toString();
  }
  if (type === 'bigint' || type === 'boolean') {
    return val.toString();
  }
  if (type === 'string') {
    return formatString(val);
  }
  if (type === 'date') {
    if (isNaN(val.getTime())) {
      throw new TypeError('cannot serialize invalid date');
    }
    return val.toISOString();
  }
  if (type === 'object') {
    return stringifyInlineTable(val);
  }
  if (type === 'array') {
    return stringifyArray(val);
  }
  return '';
}

function stringifyInlineTable(obj: any): string {
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return '{}';
  }

  let res = '{ ';
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i) {
      res += ', ';
    }
    res += KEY_REGEX.test(key) ? key : formatString(key);
    res += ' = ';
    res += stringifyValue(obj[key]);
  }
  return `${res} }`;
}

function stringifyArray(array: unknown[]): string {
  if (array.length === 0) {
    return '[]';
  }

  let res = '[ ';
  for (let i = 0; i < array.length; i++) {
    if (i > 0) {
      res += ', ';
    }
    if (array[i] === null || array[i] === void 0) {
      throw new TypeError('arrays cannot contain null or undefined values');
    }

    res += stringifyValue(array[i]);
  }

  return `${res} ]`;
}

function stringifyArrayTable(array: unknown[], key: string, commentMap: Map<string, CommentRecord[]>): string {
  let res = '';
  for (let i = 0; i < array.length; i++) {
    res += `[[${key}]]\n`;
    res += stringifyTable(array[i], key, '', commentMap);
    res += '\n\n';
  }

  return res;
}

function getComment(commentMap: Map<string, CommentRecord[]>, key: string, location: LocationEnum,
  prefixSpace: string): { beforeComment: string; afterComment: string } {
  if (!commentMap.has(key)) {
    return {beforeComment: '', afterComment: ''};
  }
  const commentRecords = commentMap.get(key);
  if (commentRecords === undefined || commentRecords.length <= 0) {
    return {beforeComment: '', afterComment: ''};
  }
  const beforeComments: string[] = [];
  const afterComments: string[] = [];
  commentRecords.forEach(commentRecord => {
    if (commentRecord.location === LocationEnum.BEFORE) {
      beforeComments.push(commentRecord.comment);
    } else {
      afterComments.push(commentRecord.comment);
    }
  });

  return {beforeComment: beforeComments.length > 0 ? `${prefixSpace}${beforeComments.join(`\n${prefixSpace}`)}\n` : '',
    afterComment: afterComments.length > 0 ? ` ${afterComments.join('\n')}` : ''};
}

function stringifyTable(obj: any, prefix: string, prefixSpace: string,
  commentMap: Map<string, CommentRecord[]>): string {
  let preamble = '';
  let tables = '';

  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const itemKey = keys[i];
    if (obj[itemKey] !== null && obj[itemKey] !== void 0) {
      const type = getTypeName(obj[itemKey]);
      if (type === 'symbol' || type === 'function') {
        throw new TypeError(`cannot serialize values of type '${type}'`);
      }
      const key = KEY_REGEX.test(itemKey) ? itemKey : formatString(itemKey);
      const currentKey = prefix ? `${prefix}.${key}` : key;
      const {beforeComment, afterComment} = getComment(commentMap, currentKey, LocationEnum.BEFORE, prefixSpace);
      if (type === 'array' && isArrayOfTables(obj[itemKey])) {
        tables += beforeComment + prefixSpace + stringifyArrayTable(obj[itemKey], currentKey, commentMap);
      } else if (type === 'object') {
        const tblKey = currentKey;
        tables += `${beforeComment}${prefixSpace}[${tblKey}]${afterComment}\n`;
        tables += stringifyTable(obj[itemKey], tblKey, `${prefixSpace}  `, commentMap);
      } else {
        preamble += beforeComment + prefixSpace + key;
        preamble += ' = ';
        preamble += stringifyValue(obj[itemKey], type) + afterComment;
        preamble += '\n';
      }
    }
    if (prefix === '') {
      tables += '\n';
    }
  }

  return `${preamble}${tables}`;
}

export function stringifyToml(obj: unknown, commentMap: Map<string, CommentRecord[]>): string {
  if (getTypeName(obj) !== 'object') {
    throw new TypeError('stringify can only be called with an object');
  }
  const res = stringifyTable(obj, '', '', commentMap);
  return (res !== undefined && res !== null) ? `${res.trim()}\n` : res;
}