/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type {TaskExecution} from 'vscode';

export type DebuggerType = 'cjdb';

export type StartDebugType = 'launch' | 'attach';

export type CangjieBackendType = 'CJNative' | 'CJVM';

export type DapMessageType = 'request' | 'response' | 'event';

export type BuildType = 'singleFile' | 'singleFile(CJVM)' | 'cangjieProject' | 'chooseFile';

export type DebugMacro = 'debugMacro' | '';

export type DapMessageIdentity = DapRequestIdentity | DapEventIdentity;

export type DapRequestIdentity =
  'cancel'
  | 'runInTerminal'
  | 'initialize'
  | 'configurationDone'
  | 'launch'
  | 'attach'
  | 'restart'
  | 'disconnect'
  | 'terminate'
  | 'breakpointLocations'
  | 'setBreakpoints'
  | 'setFunctionBreakpoints'
  | 'setExceptionBreakpoints'
  | 'dataBreakpointInfo'
  | 'setDataBreakpoints'
  | 'setInstructionBreakpoints'
  | 'continue'
  | 'next'
  | 'stepIn'
  | 'stepOut'
  | 'stepBack'
  | 'reverseContinue'
  | 'restartFrame'
  | 'goto'
  | 'pause'
  | 'stackTrace'
  | 'scopes'
  | 'variables'
  | 'setVariable'
  | 'source'
  | 'threads'
  | 'terminateThreads'
  | 'modules'
  | 'loadedSources'
  | 'evaluate'
  | 'setExpression'
  | 'stepInTargets'
  | 'gotoTargets'
  | 'completions'
  | 'exceptionInfo'
  | 'readMemory'
  | 'debugInConsole'
  | 'disassemble'
  | 'reverseStep'
  | 'undo'
  | 'continueInReverse'
  | 'stepInReverse'
  | 'cacheDataConfig'
  | 'recordPoints'
  | 'gotoRecordPoint'
  | 'recordMessage';

export type DapEventIdentity =
  'initialized'
  | 'stopped'
  | 'continued'
  | 'exited'
  | 'terminated'
  | 'thread'
  | 'output'
  | 'breakpoint'
  | 'module'
  | 'loadedSource'
  | 'process'
  | 'capabilities'
  | 'progressStart'
  | 'progressUpdate'
  | 'progressEnd'
  | 'invalidated'
  | 'recordPointsUpdate';

export type OS = 'win' | 'linux' | 'mac';

export type Arch = 'x86' | 'arm';

export interface ProcessTaskExecution extends TaskExecution {
  processId: number;
}

export const enum CjpmFileType {
  JSON = 0,
  TOML = 1,
  NON_CANGJIE = 2
}

/**
 * Cjpm output file type
 *
 * EXECUTABLE: executable file
 * STATIC: static library files ( .a files)
 * DYNAMIC: dynamic library files (.so files on Linux, .dll files on Windows, and .dylib files on macOS)
 */
export enum ProjectType {
  EXECUTABLE = 'executable',
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}