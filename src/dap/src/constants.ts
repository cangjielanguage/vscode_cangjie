/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

export const extensionId = 'IDE-Innovation-Lab.Cangjie';

export const debuggeePathPlaceholder = '${programPath}';

export const debugType = 'cangjieDebug';

export const executableFolder = 'bin';

export const dapServerNameBase = 'dap_server';

export const launcherNameBase = 'launcher';

export const serverPortArgPrefix = '--port=';

export const serverLogPathArgPrefix = '--logpath=';

export const serverLogEnableArgPrefix = '--logEnable=';

export const serverLogPathSubFolder = '.cangjie/debug/logs/server';

export const startUpRetryMaxCount = 60;

export const startUpRetryInterval = 100;

export const cjvmPortLowerBound = 3001;

export const portLowerBound = 9995;

export const portHigherBound = 65535;

export const maximumNumberOfDataBreakpoint = 4;

export const cjpmIncrementalCompilationCommand = 'cangjie.build.incrementWithDebug';

export const spaceFillNum = 2;

export const maxFieldLength = 10000;

export const moduleJsonName = 'module.json';

export const cjpmTomlName = 'cjpm.toml';

export const logSettingsPrefix = 'cangjie.debug.log';

export const reverseDebugSettingsPrefix = 'cangjie.debug.reverseDebug';

export const reverseDebugConfigName = 'cangjieReverseDebug';

export const enableReverseDebugSettingsName = 'enableReverseDebug';

export const threadNumberSettingsName = 'cacheThreadNumber';

export const stackTraceNumberSettingsName = 'cacheStackTraceNumber';

export const scopeTypeSettingsName = 'cacheScopeTypes';

export const variablesLayerSettingsName = 'cacheVariablesLayer';

export const variablesNumberSettingsName = 'cacheSubVariablesNumber';

export const lastStoppedEvent = 'lastStoppedEvent';

export const enableDAPCommunicationLogSettingsName = 'enableDAPCommunicationLog';

export const toolsSettingsPrefix = 'cangjie.debug.tools';

export const pythonPathSettingsName = 'pythonPath';

export const defaultCacheThreadNumber = 1;

export const defaultCacheStackNumber = 0;

export const defaultCacheSubVariablesNumber = 100;

export const defaultCacheVariablesLayer = 1;

export const defaultCacheScopeTypes = 0;

export const defaultStackTracePageSize = 0;

export const defaultVariablePageSize = 100;

export const taskTitleSuffixLength = 10;

export const debugMacroCommandOption = '--debug-macro';

export const reverseBreakpointLogMsg: string = '@ReverseBreakpoint #This breakpoint is a reverse breakpoint. Please don\'t modify.';

export const delay100: number = 100;

export const cjpmDefaultPath: string = '.cjpm';