/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {TestFuncOption} from './test-func-option';
import type {UnittestExec} from './unittest-exec';
import {CjnativeUnittestExec} from './cjnative-unittest-exec';
import {checkIsValid, getSdkOption} from '../common-utils';
import {CjvmUnittestExec} from './cjvm-unittest-exec';

export async function runTest(testFuncOption: TestFuncOption): Promise<void> {
  verifyValidityOfParameters(testFuncOption);
  let unittestExec: UnittestExec = getSdkOption() === 'CJVM' ?
    new CjvmUnittestExec(testFuncOption) :
    new CjnativeUnittestExec(testFuncOption);
  await unittestExec.run();
}

export async function debugTest(testFuncOption: TestFuncOption): Promise<void> {
  verifyValidityOfParameters(testFuncOption);
  let unittestExec: UnittestExec = getSdkOption() === 'CJVM' ?
    new CjvmUnittestExec(testFuncOption) :
    new CjnativeUnittestExec(testFuncOption);
  await unittestExec.debug();
}

function verifyValidityOfParameters(testFuncOption: TestFuncOption): void {
  if (!checkIsValid(testFuncOption)) {
    throw new Error('[Unittest] The parameter is incorrect.');
  }
  if (!checkIsValid(testFuncOption.packageName)) {
    throw new Error('[Unittest] The package name is incorrect.');
  }
  if (!checkIsValid(testFuncOption.uri)) {
    throw new Error('[Unittest] The uri is incorrect.');
  }
}