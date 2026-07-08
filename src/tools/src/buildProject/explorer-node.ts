/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type { Command, TreeItemCollapsibleState } from 'vscode';
import { TreeItem } from 'vscode';

export class NodeData extends TreeItem {
  contextValue = this.viewItemName;

  constructor(
    treeItemAttr: TreeItemAttr,
    public viewItemName: string,
    public path?: string,
    public parent?: NodeData,
    command?: Command) {
    super(treeItemAttr.label, treeItemAttr.collapsibleState);
    this.tooltip = (this.path !== null && this.path !== undefined) ? this.path : '';
    this.description = (this.path !== null && this.path !== undefined) ? this.path : '';
    this.viewItemName = viewItemName;
    this.parent = parent;
    this.command = command;
  }
}

interface TreeItemAttr {
  label: string;
  collapsibleState: TreeItemCollapsibleState;
}