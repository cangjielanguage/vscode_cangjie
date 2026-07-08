/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import { Utility } from '../util/utils';
import { OutputHelper } from '../util/output-helper';
import { Webview } from '../util/webview';
import {CJLINT_CONFIG_NAME, CJPM_TOML} from '../util/constant-num';

export class CjlintWebview extends Webview {
  private disposable: vscode.Disposable;
  private disposableFolder: vscode.Disposable;
  private _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    super();
    this._context = context;
    this.disposable = vscode.Disposable.from(
      vscode.commands.registerCommand('cangjie.cjlint', async (uri:vscode.Uri, isDiagnostic: boolean = false, needWebview: boolean = true) => {
        this.init(isDiagnostic, needWebview);
      })
    );
    this.disposableFolder = vscode.Disposable.from(
      vscode.commands.registerCommand('cangjie.cjlintFloder', async (uri:vscode.Uri, isDiagnostic: boolean = false, needWebview: boolean = true) => {
        this.init(isDiagnostic, needWebview);
      })
    );
  }

  static deleteFiles(folderPath: string): void {
    let jsonPath = path.join(folderPath, './report.json');
    let defaultPath = path.join(folderPath, './default_CHIRDebug');
    let pagePath = path.join(folderPath, './page_CHIRDebug');
    if (jsonPath.indexOf('..') < 0 && fs.existsSync(jsonPath)) {
      fs.rm(jsonPath, () => {});
    }
    if (defaultPath.indexOf('..') < 0 && fs.existsSync(defaultPath)) {
      fs.rm(defaultPath, () => {});
    }
    if (pagePath.indexOf('..') < 0 && fs.existsSync(pagePath)) {
      fs.rm(pagePath, () => {});
    }
  }

  static goFileLocation(fileName: string, line: number, column: number): void {
    if (fs.existsSync(fileName)) {
      vscode.workspace.openTextDocument(fileName).then(document => {
        vscode.window.showTextDocument(document, 1, false).then(editor => {
          let docComment = editor.document;
          let start = docComment.lineAt(line).range.start.character;
          let end = docComment.lineAt(line).range.end.character;
          let range = new vscode.Range(line, start, line, end);
          editor.revealRange(range, 1);
          editor.selection = new vscode.Selection(new vscode.Position(line, column), new vscode.Position(line, column));
        });
      });
    } else {
      OutputHelper.appendLine(`${fileName} not found`);
    }
  }

  dispose(): void {
    this.disposable.dispose();
    this.disposableFolder.dispose();
  }

  init(isDiagnostic: boolean = false, needWebview: boolean = true): void {
    if (process.platform !== 'linux' && process.platform !== 'win32' && process.platform !== 'darwin') {
      vscode.window.showInformationMessage('This command applies only to Linux, Windows and Mac.');
      return;
    }
    const cjProjectPath = Utility.getCjRootProjectPath();
    let folderPath = Utility.getSrcPath(path.join(cjProjectPath, CJPM_TOML));
    if (!isDiagnostic) {
      OutputHelper.appendLine(`cjlint starts checking "${folderPath}" `);
    }
    if (folderPath.indexOf('..') >= 0) {
      vscode.window.showErrorMessage('the target path is invaild!');
      return;
    }
    CjlintWebview.deleteFiles(folderPath);
    let cmd = `cjlint -f '${folderPath}' -o ./report`;
    if (process.platform === 'win32') {
      // the "" is used to handle path with space in windows
      cmd = `cjlint -f "${folderPath}" -o ./report`;
    }
    const cjlintExcludePath = path.join(cjProjectPath, CJLINT_CONFIG_NAME);
    if (fs.existsSync(cjlintExcludePath) === true) {
      cmd = `${cmd} -e ${path.relative(folderPath, cjlintExcludePath)}`;
    }
    cp.exec(Utility.getExecCmd(cmd), { cwd: folderPath, encoding: 'binary' }, (_error, _stdout, stderr) => {
      if (Utility.checkIsValid(stderr)) {
        if (!isDiagnostic) {
          const message = Utility.translateMessage(stderr);
          OutputHelper.appendLine(`cjlint check failed: ${message}`);
        }
        this.closePanel();
        CjlintWebview.deleteFiles(folderPath);
        return;
      }
      const result = fs.readFileSync(path.join(folderPath, './report.json'), 'utf-8');
      const resultJson = JSON.parse(result);
      CjlintWebview.deleteFiles(folderPath);

      // excute to show diagnostic
      vscode.commands.executeCommand('cangjie.codecheck.diagnostic', resultJson);

      if (result === 'null' || result === '[\r\n]' || resultJson.length <= 0) {
        if (!isDiagnostic) { 
          OutputHelper.appendLine('The cjlint check is done, there are no out-of-spec issues.\n');
        }
        this.closePanel();
        return;
      }
      if (!needWebview) {
        return;
      }
      this.generateWebview(resultJson, isDiagnostic);
    });
  }

  generateWebview(resultJson: unknown, isDiagnostic: boolean): void {
    super.newPanel('cjlintWebview', 'codecheck');
    this.panel.webview.onDidReceiveMessage(message => {
      CjlintWebview.goFileLocation(message.fileName, message.line - 1, message.column - 1);
    });
    let json = JSON.stringify(resultJson, ['description', 'file', 'line', 'column', 'endLine', 'endColumn', 'defectLevel', 'defectType']);
    // keep escape symbol consistent
    json = json.replace(/\\/g, '\\\\');
    this.panel.webview.postMessage(JSON.parse(json));
    this.resultPage();
    if (!isDiagnostic) {
      OutputHelper.appendLine('cjlint check completed\n');
    }
  }

  resultPage(): void {
    this.panel.webview.html = this.html('html/contentHtml.html');
  }

  html(templatePath: string): string {
    const { extensionPath } = this._context;
    const htmlPath = path.join(extensionPath, templatePath);
    let html = fs.readFileSync(htmlPath, 'utf-8');
    const cjlintJsUri: vscode.Uri = this.panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(extensionPath, 'media', 'CjlintResult.js'))
    );
    html = html.replace(/{{cjlint_js_uri}}/g, cjlintJsUri.toString());
    return html;
  }
}