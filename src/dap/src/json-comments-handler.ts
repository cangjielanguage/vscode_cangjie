/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

enum CommentType {
  NOTCOMMENT = 0,
  SINGLECOMMENT = 1,
  MULTICOMMENT = 2
}

export class JsonCommentsHandler {
  private isInsideString: boolean;
  private isInsideComment: CommentType;
  private offset: number;
  private buffer: string;
  private result: string;
  private commaIndex: number;
  private readonly jsonString: string;

  constructor(jsonString: string) {
    this.jsonString = jsonString;
    this.isInsideString = false;
    this.isInsideComment = CommentType.NOTCOMMENT;
    this.offset = 0;
    this.buffer = '';
    this.result = '';
    this.commaIndex = -1;
  }

  private static strip(str: string, start: number, end: number): string {
    return str.slice(start, end).replace(/\S/g, ' ');
  }

  private static isEscaped(jsonString: string, quotePosition: number): boolean {
    let index = quotePosition - 1;
    let backslashCount = 0;
    while (jsonString[index] === '\\') {
      index -= 1;
      backslashCount += 1;
    }
    const evenNumber:number = 2;
    return Boolean(backslashCount % evenNumber);
  }

  public stripJsonComments(): string {
    if (typeof this.jsonString !== 'string') {
      throw new TypeError(`Expected argument \`jsonString\` to be a \`string\`, got \`${typeof this.jsonString}\``);
    }
    for (let index = 0; index < this.jsonString.length; index++) {
      const currentCharacter = this.jsonString[index];
      const nextCharacter = this.jsonString[index + 1];

      if (!this.isInsideComment && currentCharacter === '"') {
        const escaped = JsonCommentsHandler.isEscaped(this.jsonString, index);
        if (!escaped) {
          this.isInsideString = !this.isInsideString;
        }
      }
      if (this.isInsideString) {
        continue;
      }
      if (!this.isInsideComment && currentCharacter + nextCharacter === '//') {
        this.enterSingleLineComments(index);
      } else if (this.isInsideComment === CommentType.SINGLECOMMENT && currentCharacter + nextCharacter === '\r\n') {
        this.exitSingleLineComments(index);
      } else if (this.isInsideComment === CommentType.SINGLECOMMENT && currentCharacter === '\n') {
        this.exitSingleLineComments2(index);
      } else if (!this.isInsideComment && currentCharacter + nextCharacter === '/*') {
        this.enterMultilineComments(index);
      } else if (this.isInsideComment === CommentType.MULTICOMMENT && currentCharacter + nextCharacter === '*/') {
        this.exitMultilineComments(index);
      } else if (!this.isInsideComment) {
        this.handleNotComment(currentCharacter, index);
      } else {
        // do nothing
      }
    }

    return this.result + this.buffer + (this.isInsideComment ?
      JsonCommentsHandler.strip(this.jsonString.slice(this.offset), 0, 0) : this.jsonString.slice(this.offset));
  }

  private enterSingleLineComments(index: number): void {
    this.buffer += this.jsonString.slice(this.offset, index);
    this.offset = index;
    this.isInsideComment = CommentType.SINGLECOMMENT;
  }

  private exitSingleLineComments(index: number): void {
    let offsetIndex = index + 1;
    this.isInsideComment = CommentType.NOTCOMMENT;
    this.buffer += JsonCommentsHandler.strip(this.jsonString, this.offset, offsetIndex);
    this.offset = offsetIndex;
  }

  private exitSingleLineComments2(index: number): void {
    this.isInsideComment = CommentType.NOTCOMMENT;
    this.buffer += JsonCommentsHandler.strip(this.jsonString, this.offset, index);
    this.offset = index;
  }

  private enterMultilineComments(index: number): void {
    this.buffer += this.jsonString.slice(this.offset, index);
    this.offset = index;
    this.isInsideComment = CommentType.MULTICOMMENT;
  }

  private exitMultilineComments(index: number): void {
    let offsetIndex = index + 1;
    this.isInsideComment = CommentType.NOTCOMMENT;
    this.buffer += JsonCommentsHandler.strip(this.jsonString, this.offset, offsetIndex + 1);
    this.offset = offsetIndex + 1;
  }

  private handleNotComment(currentCharacter: string, index: number): void {
    if (this.commaIndex !== -1) {
      if (currentCharacter === '}' || currentCharacter === ']') {
        this.buffer += this.jsonString.slice(this.offset, index);
        this.result += JsonCommentsHandler.strip(this.buffer, 0, 1) + this.buffer.slice(1);
        this.buffer = '';
        this.offset = index;
        this.commaIndex = -1;
      } else if (currentCharacter !== ' ' && currentCharacter !== '\t' && currentCharacter !== '\r' &&
        currentCharacter !== '\n') {
        this.buffer += this.jsonString.slice(this.offset, index);
        this.offset = index;
        this.commaIndex = -1;
      } else {
        // do nothing
      }
    } else if (currentCharacter === ',') {
      this.result += this.buffer + this.jsonString.slice(this.offset, index);
      this.buffer = '';
      this.offset = index;
      this.commaIndex = index;
    } else {
      // do nothing
    }
  }
}