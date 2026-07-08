/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage", 
  coverageReporters: ["text-summary", "clover", "json", "lcov"],
  reporters: [
    "default",
    [
      'jest-junit',    // 通过jest-junit生成成功率报告，给CodeCov解析
      {
        outputDirectory: '<rootDir>/success',
        outputName: 'report.xml'
      }
    ]
  ],
  moduleFileExtensions: [
    "js",
    "ts",
    "json",
  ],
  testMatch: ["**/src/dap/test/**/*.test.ts"],
};