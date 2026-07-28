/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {
  defaultCacheScopeTypes,
  defaultCacheStackNumber,
  defaultCacheSubVariablesNumber,
  defaultCacheThreadNumber,
  defaultCacheVariablesLayer,
  reverseDebugSettingsPrefix,
  scopeTypeSettingsName,
  stackTraceNumberSettingsName,
  threadNumberSettingsName,
  variablesLayerSettingsName,
  variablesNumberSettingsName
} from '../constants';
import * as vscode from 'vscode';
import {ConfigurationTarget} from 'vscode';

enum ScopeType {
  'Locals' = 0b0001,
  'Globals' = 0b0010,
  'Statics' = 0b0100,
  'Registers' = 0b1000,
}

export class ReverseDebugConfigProperty {
  public static instance: ReverseDebugConfigProperty;

  private _cacheThreadNumber: number;

  private _cacheStackNumber: number;

  private _cacheScopeType: number;

  private _cacheVariablesLayer: number;

  private _cacheSubVariablesNumber: number;

  constructor() {
    this.doRefreshConfig();
  }

  get cacheThreadNumber(): number {
    return this._cacheThreadNumber;
  }

  set cacheThreadNumber(value: number) {
    this._cacheThreadNumber = value;
  }

  get cacheStackNumber(): number {
    return this._cacheStackNumber;
  }

  set cacheStackNumber(value: number) {
    this._cacheStackNumber = value;
  }

  get cacheScopeType(): number {
    return this._cacheScopeType;
  }

  set cacheScopeType(value: number) {
    this._cacheScopeType = value;
  }

  get cacheVariablesLayer(): number {
    return this._cacheVariablesLayer;
  }

  set cacheVariablesLayer(value: number) {
    this._cacheVariablesLayer = value;
  }

  get cacheSubVariablesNumber(): number {
    return this._cacheSubVariablesNumber;
  }

  set cacheSubVariablesNumber(value: number) {
    this._cacheSubVariablesNumber = value;
  }

  public doRefreshConfig(): void {
    const cacheThreadNumberProperty = <number>vscode.workspace.getConfiguration(reverseDebugSettingsPrefix).
      get(threadNumberSettingsName);
    const cacheStackNumberProperty = <number>vscode.workspace.getConfiguration(reverseDebugSettingsPrefix).
      get(stackTraceNumberSettingsName);
    const scopeTypesPropertyJson = vscode.workspace.getConfiguration(reverseDebugSettingsPrefix).
      get(scopeTypeSettingsName);
    const cacheVariablesLayerProperty = <number>vscode.workspace.getConfiguration(reverseDebugSettingsPrefix).
      get(variablesLayerSettingsName);
    const cacheSubVariablesNumberProperty = <number>vscode.workspace.getConfiguration(reverseDebugSettingsPrefix).
      get(variablesNumberSettingsName);

    this.cacheThreadNumber = cacheThreadNumberProperty !== null ? cacheThreadNumberProperty : defaultCacheThreadNumber;
    this.cacheStackNumber = cacheStackNumberProperty !== null ? cacheStackNumberProperty : defaultCacheStackNumber;
    this.cacheScopeType = scopeTypesPropertyJson !== null ? Object.keys(scopeTypesPropertyJson).
      map(scopeTypekey => scopeTypesPropertyJson[scopeTypekey] === true ? ScopeType[scopeTypekey] : 0).
      reduce((scopeTypeNumPre, scopeTypeNumNext) => scopeTypeNumPre | scopeTypeNumNext, 0) : defaultCacheScopeTypes;
    this.cacheVariablesLayer = cacheVariablesLayerProperty !== null ?
      cacheVariablesLayerProperty : defaultCacheVariablesLayer;
    this.cacheSubVariablesNumber = cacheSubVariablesNumberProperty !== null ?
      cacheSubVariablesNumberProperty : defaultCacheSubVariablesNumber;
  }
}

export function resetReverseSettingName(): void {
  const scopeTypesPropertyJson = vscode.workspace.getConfiguration(reverseDebugSettingsPrefix).
    get(scopeTypeSettingsName);
  if (scopeTypesPropertyJson === undefined) {
    return;
  }
  let scopeTypesConfig = {};
  Object.keys(ScopeType).filter(scopeType => Object.prototype.hasOwnProperty.call(scopeTypesPropertyJson, scopeType)).
    forEach(scopeType => scopeTypesConfig[scopeType] = scopeTypesPropertyJson[scopeType]);
  if (scopeTypesPropertyJson['Globals & Statics'] === true) {
    scopeTypesConfig['Globals'] = true;
    scopeTypesConfig['Statics'] = true;
  }
  const allSettings = vscode.workspace.getConfiguration(reverseDebugSettingsPrefix).inspect(scopeTypeSettingsName);
  if (allSettings === undefined) {
    return;
  }
  // remove scope config 'Globals & Statics'
  if (allSettings.globalValue !== undefined &&
    Object.prototype.hasOwnProperty.call(allSettings.globalValue, 'Globals & Statics')) {
    vscode.workspace.getConfiguration(reverseDebugSettingsPrefix).
      update(scopeTypeSettingsName, scopeTypesConfig, ConfigurationTarget.Global);
  }
  if (allSettings.workspaceValue !== undefined &&
    Object.prototype.hasOwnProperty.call(allSettings.workspaceValue, 'Globals & Statics')) {
    vscode.workspace.getConfiguration(reverseDebugSettingsPrefix).
      update(scopeTypeSettingsName, scopeTypesConfig, ConfigurationTarget.Workspace);
  }
}