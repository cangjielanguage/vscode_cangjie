/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import { Command } from './command';
import { checkIsValid } from '../common-utils';

export class CjpmTestCommand extends Command {
  debug: boolean;
  noRun: boolean;
  incremental: boolean;
  skipBuild: boolean;
  jobs: number;
  verbose: boolean;
  bench: boolean;
  coverage: boolean;
  condition: string;
  target: string;
  filter: string;
  randomSeed: number;
  noColor: boolean;
  isolateAll: boolean;
  isolateAllTimeout: string;

  constructor(debug: boolean, noRun: boolean, incremental: boolean, skipBuild: boolean, jobs: number, verbose: boolean, bench: boolean,
    coverage: boolean, condition: string, target: string, filter: string, randomSeed: number,
    noColor: boolean, isolateAll: boolean, isolateAllTimeout: string, command?: string) {
    super(command);
    this.debug = debug;
    this.noRun = noRun;
    this.incremental = incremental;
    this.skipBuild = skipBuild;
    this.jobs = jobs;
    this.verbose = verbose;
    this.bench = bench;
    this.coverage = coverage;
    this.condition = condition;
    this.target = target;
    this.filter = filter;
    this.randomSeed = randomSeed;
    this.noColor = noColor;
    this.isolateAll = isolateAll;
    this.isolateAllTimeout = isolateAllTimeout;
  }

  generateCommand(): string {
    let command = '';
    if (checkIsValid(this.command)) {
      command += this.command;
    }
    this.command = '';
    if (checkIsValid(this.debug)) {
      command += ' -g';
    }
    if (checkIsValid(this.noRun)) {
      command += ' --no-run';
    }
    if (checkIsValid(this.incremental)) {
      command += ' -i';
    }
    if (checkIsValid(this.skipBuild)) {
      command += ' --skip-build';
    }
    if (checkIsValid(this.jobs)) {
      command += ` --jobs ${this.jobs}`;
    }
    if (checkIsValid(this.verbose)) {
      command += ' --verbose';
    }
    if (checkIsValid(this.bench)) {
      command += ' --bench';
    }
    if (checkIsValid(this.coverage)) {
      command += ' --coverage';
    }
    if (checkIsValid(this.condition)) {
      command += ` --condition="${this.condition}"`;
    }
    if (checkIsValid(this.target)) {
      command += ` --target ${this.target}`;
    }
    if (checkIsValid(this.filter)) {
      command += ` --filter=${this.filter}`;
    }
    if (checkIsValid(this.randomSeed)) {
      command += ` --random-seed ${this.randomSeed}`;
    }
    if (checkIsValid(this.noColor)) {
      command += ' --no-color';
    }
    if (checkIsValid(this.isolateAll)) {
      command += ' --isolate-all';
    }
    if (checkIsValid(this.isolateAllTimeout)) {
      command += ` --isolate-all-timeout=${this.isolateAllTimeout}`;
    }
    return command;
  }
}