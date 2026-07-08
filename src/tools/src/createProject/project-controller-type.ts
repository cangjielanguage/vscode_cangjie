/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type { QuickPickItem } from 'vscode';

export enum CompileBackendType {
  CJNATIVE = 'CJNative',
  CJVM = 'CJVM',
}

export interface CjCompileBackendType {
  displayName: string;
  metadata: CjCompileBackendMetadata;
  description?: string;
  detail?: string;
}

export interface CjCompileBackendMetadata {
  type: CompileBackendType;
  extensionId: string;
  extensionName: string;
  createCommandId: string;
}

export interface CjCompileBackendTypeQuickPick extends QuickPickItem {
  metadata: CjCompileBackendMetadata;
}

export const compileBackendTypes: CjCompileBackendType[] = [
  {
    displayName: 'Create CJNative Cangjie project',
    metadata: {
      type: CompileBackendType.CJNATIVE,
      extensionId: '',
      extensionName: '',
      createCommandId: '',
    },
  },
  {
    displayName: 'Create CJVM Cangjie project',
    metadata: {
      type: CompileBackendType.CJVM,
      extensionId: '',
      extensionName: '',
      createCommandId: '',
    },
  },
];

export enum ProjectType {
  EXECUTABLE = 'executable',
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

export interface CjProjectType {
  displayName: string;
  metadata: CjProjectTypeMetadata;
  description?: string;
  detail?: string;
}

export interface CjProjectTypeMetadata {
  type: ProjectType;
  extensionId: string;
  extensionName: string;
  createCommandId: string;
}

export interface CjProjectTypeQuickPick extends QuickPickItem {
  metadata: CjProjectTypeMetadata;
}

export const projectTypes: CjProjectType[] = [
  {
    displayName: 'Create Executable Output Cangjie project',
    metadata: {
      type: ProjectType.EXECUTABLE,
      extensionId: '',
      extensionName: '',
      createCommandId: '',
    },
  },
  {
    displayName: 'Create Static Output Cangjie project',
    metadata: {
      type: ProjectType.STATIC,
      extensionId: '',
      extensionName: '',
      createCommandId: '',
    },
  },
  {
    displayName: 'Create Dynamic Output Cangjie project',
    metadata: {
      type: ProjectType.DYNAMIC,
      extensionId: '',
      extensionName: '',
      createCommandId: '',
    },
  },
];