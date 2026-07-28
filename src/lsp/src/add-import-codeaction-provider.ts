/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import * as vscode from 'vscode';

interface ServerTextEdit {
  range: vscode.Range;
  newText: string;
}

interface ServerCodeAction {
  title: string;
  kind?: string;
  edit?: {
    changes?: {
      [uri: string]: ServerTextEdit[];
    };
  };
}

interface LSPDiagnostic extends vscode.Diagnostic {
  data?: {
    codeActions?: ServerCodeAction[];
  };
}

const ADD_IMPORT_CMD = 'cangjie.addImport';
const ADD_ALL_IMPORTS_CMD = 'cangjie.addAllImports';

function isAddImportAction(kind?: string): boolean {
  return kind === 'quickfix.addImport';
}

function isAddImportAllAction(kind?: string): boolean {
  return kind === 'quickfix.addImportAll';
}

export class AddImportCodeActionProvider implements vscode.CodeActionProvider {
  private static instance: AddImportCodeActionProvider;

  public static getInstance(): AddImportCodeActionProvider {
    if (!AddImportCodeActionProvider.instance) {
      AddImportCodeActionProvider.instance = new AddImportCodeActionProvider();
    }
    return AddImportCodeActionProvider.instance;
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const { addImportAllActions, addImportActions } = this.collectCodeActions(context);

    for (const action of addImportAllActions) {
      action.isPreferred = true;
    }

    const hasAddImportAll = addImportAllActions.length > 0;
    for (const action of addImportActions) {
      action.isPreferred = !hasAddImportAll;
    }

    return [...addImportAllActions, ...addImportActions];
  }

  private collectCodeActions(context: vscode.CodeActionContext): {
    addImportAllActions: vscode.CodeAction[];
    addImportActions: vscode.CodeAction[];
  } {
    const addImportAllActions: vscode.CodeAction[] = [];
    const addImportActions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      const codeActions = this.extractAddImportActions(diagnostic);
      addImportAllActions.push(...codeActions.addImportAll);
      addImportActions.push(...codeActions.addImport);
    }

    return { addImportAllActions, addImportActions };
  }

  private extractAddImportActions(diagnostic: vscode.Diagnostic): {
    addImportAll: vscode.CodeAction[];
    addImport: vscode.CodeAction[];
  } {
    const lspDiagnostic = diagnostic as LSPDiagnostic;
    const codeActions = lspDiagnostic.data?.codeActions || [];
    const addImportAll: vscode.CodeAction[] = [];
    const addImport: vscode.CodeAction[] = [];

    for (const serverAction of codeActions) {
      if (isAddImportAllAction(serverAction.kind)) {
        const action = this.createAddAllImportsAction(diagnostic, serverAction);
        if (action) {
          addImportAll.push(action);
        }
      } else if (isAddImportAction(serverAction.kind)) {
        const action = this.createAddImportAction(diagnostic, serverAction);
        if (action) {
          addImport.push(action);
        }
      }
    }

    return { addImportAll, addImport };
  }

  private createAddImportAction(
    diagnostic: vscode.Diagnostic,
    serverAction: ServerCodeAction
  ): vscode.CodeAction | null {
    const workspaceEdit = this.createWorkspaceEdit(serverAction);
    if (!workspaceEdit) {
      return null;
    }

    const action = new vscode.CodeAction(serverAction.title, vscode.CodeActionKind.QuickFix);
    action.diagnostics = [diagnostic];
    action.command = {
      title: serverAction.title,
      command: ADD_IMPORT_CMD,
      arguments: [workspaceEdit],
    };

    return action;
  }

  private createAddAllImportsAction(
    diagnostic: vscode.Diagnostic,
    serverAction: ServerCodeAction
  ): vscode.CodeAction | null {
    const workspaceEdit = this.createWorkspaceEdit(serverAction);
    if (!workspaceEdit) {
      return null;
    }

    const title = 'Import all symbols';

    const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    action.diagnostics = [diagnostic];
    action.command = {
      title,
      command: ADD_ALL_IMPORTS_CMD,
      arguments: [workspaceEdit],
    };

    return action;
  }

  private createWorkspaceEdit(serverAction: ServerCodeAction): vscode.WorkspaceEdit | null {
    if (!serverAction?.edit?.changes) {
      return null;
    }

    const edit = new vscode.WorkspaceEdit();
    for (const [uri, textEdits] of Object.entries(serverAction.edit.changes)) {
      for (const textEdit of textEdits) {
        const range = new vscode.Range(
          textEdit.range.start.line,
          textEdit.range.start.character,
          textEdit.range.end.line,
          textEdit.range.end.character
        );
        if (textEdit.newText === '') {
          edit.delete(vscode.Uri.parse(uri), range);
        } else {
          edit.insert(vscode.Uri.parse(uri), range.start, textEdit.newText);
        }
      }
    }
    return edit;
  }
}

export function registerAddImportCodeActionProvider(context: vscode.ExtensionContext): vscode.Disposable {
  const provider = AddImportCodeActionProvider.getInstance();

  const addImportDisposable = vscode.commands.registerCommand(
    ADD_IMPORT_CMD,
    async (edit: vscode.WorkspaceEdit) => {
      await vscode.workspace.applyEdit(edit);
    }
  );

  const addAllImportsDisposable = vscode.commands.registerCommand(
    ADD_ALL_IMPORTS_CMD,
    async (edit: vscode.WorkspaceEdit) => {
      await vscode.workspace.applyEdit(edit);
    }
  );

  const providerDisposable = vscode.languages.registerCodeActionsProvider(
    { language: 'Cangjie', scheme: 'file' },
    provider,
    {
      providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
    }
  );

  context.subscriptions.push(addImportDisposable, addAllImportsDisposable);

  return vscode.Disposable.from(providerDisposable, addImportDisposable, addAllImportsDisposable);
}