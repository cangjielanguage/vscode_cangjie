/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {checkIsValid} from '../common-utils';
import type {CjpmTestCommand} from './cjpm-test-command';
import {CjpmTestCommandBuilder} from './builder/cjpm-test-command-builder';
import {TestType} from '../ut/test-func-option';
import type {TestFuncOption} from '../ut/test-func-option';

export class CommandUtil {
  public static buildUtCommand(funcOption: TestFuncOption, testType: TestType, debug = false, noRun = true): string {
    let command = new CjpmTestCommandBuilder().
      setDebug(debug).
      setNoRun(noRun).
      setIncremental(true).
      buildCommand();
    return (command as CjpmTestCommand).generateCommand();
  }

  public static runUtArgs(funcOption: TestFuncOption, testType: TestType): string {
    let command = new CjpmTestCommandBuilder().
      setFilter(this.generateFilterParam(funcOption, testType)).
      buildParam();
    return (command as CjpmTestCommand).generateCommand();
  }

  private static generateFilterParam(funcOption: TestFuncOption, testType: TestType): string {
    switch (testType) {
      case TestType.FUNC: {
        let classRegex = checkIsValid(funcOption.className) ? funcOption.className + '.' : '';
        let funcRegex = checkIsValid(funcOption.functionName) ? funcOption.functionName : '*';
        return `${classRegex}${funcRegex}`;
      }
      case TestType.CLASS: {
        return `${checkIsValid(funcOption.className) ? funcOption.className : '*'}.*`;
      }
      case TestType.FILE:
      case TestType.PACKAGE: {
        return '*.*';
      }
      default:
        return '';
    }
  }
}