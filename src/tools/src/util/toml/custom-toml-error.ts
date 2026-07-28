/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {LINE_SPLITTER_REGEX, TWO_POS_OFFSET} from './toml-constants';
import {getLineColFromPos, isEmpty} from './toml-util';

function makeCodeBlock(string: string, line: number, column: number): string {
  const lines = string.split(LINE_SPLITTER_REGEX);
  let tomlCodeBlock = '';
  const numberLen = (Math.log10(line) | 0) + 1;
  for (let i = line - 1; i <= line; i++) {
    const lineContent = lines[i - 1];
    if (isEmpty(lineContent)) {
      continue;
    }
    tomlCodeBlock += i.toString().padEnd(numberLen, ' ');
    tomlCodeBlock += ' |  ';
    tomlCodeBlock += lineContent;
    tomlCodeBlock += '\n';
    if (i === line) {
      tomlCodeBlock += ' '.repeat(numberLen + column + TWO_POS_OFFSET);
      tomlCodeBlock += '^\n';
    }
  }
  return tomlCodeBlock.trim();
}

export default class CustomTomlError extends Error {
  errorLine: number;
  errorColumn: number;
  errorCodeBlock: string;

  constructor(message: string, tomlContent: string, startPosition: number) {
    const [line, column] = getLineColFromPos(tomlContent, startPosition);
    const codeBlock = makeCodeBlock(tomlContent, line, column);
    super(`Invalid TOML Config: ${message}\n${codeBlock}`);
    this.errorLine = line;
    this.errorColumn = column;
    this.errorCodeBlock = codeBlock;
  }
}