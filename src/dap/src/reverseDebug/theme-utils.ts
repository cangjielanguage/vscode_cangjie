/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';

export function isCurThemeDark(): boolean {
  return vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark || vscode.window.activeColorTheme.kind ===
    vscode.ColorThemeKind.HighContrast;
}

export function addThemeChangedListener(callback: (isDark: boolean) => void): vscode.Disposable {
  return vscode.window.onDidChangeActiveColorTheme(event => {
    callback(event.kind === vscode.ColorThemeKind.Dark || event.kind === vscode.ColorThemeKind.HighContrast);
  });
}