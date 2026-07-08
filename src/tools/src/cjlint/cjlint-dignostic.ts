/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import { Utility } from '../util/utils';

export class CjlintDiagnostic {
  public static _instance: CjlintDiagnostic;
  private cjlintDiagnostics: vscode.DiagnosticCollection;
  
  constructor() {
    this.cjlintDiagnostics = vscode.languages.createDiagnosticCollection('cjlintDiagnostics');
  }

  handleCjlintResult(result): void {
    this.clearCjlintResult();
    if (result instanceof Array) {
      result.forEach((item) => {
        let range = new vscode.Range(item.line - 1, item.column - 1, item.endLine - 1, item.endColumn - 1);
        if (item.line === item.endLine && item.column === item.endColumn) {
          range = new vscode.Range(item.line - 1, 0, item.line - 1, Number.MAX_VALUE);
        }
        let severity = vscode.DiagnosticSeverity.Warning;
        if (item.defectLevel === 'MANDATORY') {
          severity = vscode.DiagnosticSeverity.Error;
        }
        const diagnostic = new vscode.Diagnostic(range, item.description, severity);
        const uri = vscode.Uri.file(item.file);
        let fileDiagnostics = this.cjlintDiagnostics.get(uri);
        if (Utility.checkIsValid(fileDiagnostics)) {
          fileDiagnostics = fileDiagnostics.concat(diagnostic);
        } else {
          fileDiagnostics = [diagnostic];
        }
        this.cjlintDiagnostics.set(uri, fileDiagnostics);
      });
    }
  }

  clearCjlintResult(): void {
    this.cjlintDiagnostics.clear();
  }
}