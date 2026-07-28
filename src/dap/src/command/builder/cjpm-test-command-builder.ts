/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {CjpmTestCommand} from '../cjpm-test-command';
import {CommandBuilder} from './command-builder';
import type {Command} from '../command';

export class CjpmTestCommandBuilder extends CommandBuilder {
  private readonly command: string = 'cjpm test';
  private debug: boolean;
  private noRun: boolean;
  private incremental: boolean;
  private skipBuild: boolean;
  private jobs: number;
  private verbose: boolean;
  private bench: boolean;
  private coverage: boolean;
  private condition: string;
  private target: string;
  private filter: string;
  private randomSeed: number;
  private noColor: boolean;
  private isolateAll: boolean;
  private isolateAllTimeout: string;
  setDebug(debug: boolean): this {
    this.debug = debug;
    return this;
  }

  setNoRun(noRun: boolean): this {
    this.noRun = noRun;
    return this;
  }

  setIncremental(incremental: boolean): this {
    this.incremental = incremental;
    return this;
  }

  setSkipBuild(skipBuild: boolean): this {
    this.skipBuild = skipBuild;
    return this;
  }

  setJobs(jobs: number): this {
    this.jobs = jobs;
    return this;
  }

  setVerbose(verbose: boolean): this {
    this.verbose = verbose;
    return this;
  }

  setBench(bench: boolean): this {
    this.bench = bench;
    return this;
  }

  setCoverage(coverage: boolean): this {
    this.coverage = coverage;
    return this;
  }

  setCondition(condition: string): this {
    this.condition = condition;
    return this;
  }

  setTarget(target: string): this {
    this.target = target;
    return this;
  }

  setFilter(filter: string): this {
    this.filter = filter;
    return this;
  }

  setRandomSeed(randomSeed: number): this {
    this.randomSeed = randomSeed;
    return this;
  }

  setNoColor(noColor: boolean): this {
    this.noColor = noColor;
    return this;
  }

  setIsolateAll(isolateAll: boolean): this {
    this.isolateAll = isolateAll;
    return this;
  }

  setIsolateAllTimeout(isolateAllTimeout: string): this {
    this.isolateAllTimeout = isolateAllTimeout;
    return this;
  }

  buildCommand(): Command {
    return new CjpmTestCommand(this.debug, this.noRun, this.incremental, this.skipBuild, this.jobs, this.verbose,
      this.bench, this.coverage, this.condition, this.target, this.filter, this.randomSeed, this.noColor,
      this.isolateAll, this.isolateAllTimeout, this.command);
  }

  buildParam(): Command {
    return new CjpmTestCommand(this.debug, this.noRun, this.incremental, this.skipBuild, this.jobs, this.verbose,
      this.bench, this.coverage, this.condition, this.target, this.filter, this.randomSeed, this.noColor,
      this.isolateAll, this.isolateAllTimeout);
  }
}