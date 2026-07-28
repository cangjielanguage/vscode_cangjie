/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import type { Event, ExtensionContext, TreeDataProvider, TreeItem } from 'vscode';
import { EventEmitter, TreeItemCollapsibleState, window } from 'vscode';
import { NodeData } from './explorer-node';
import { requireCategory, CJPM_TOML, requireCategoryNew, packageRequieChild, BIN_DEPENDENCIES, FFI, C, TARGET } from '../util/constant-num';
import { Utility } from '../util/utils';
import * as path from 'path';
import type { CustomTomlTypes } from '../util/toml/toml-types';

export class LibTreeDataProvider implements TreeDataProvider<NodeData> {
  readonly onDidChangeTreeData: Event<NodeData | undefined | void>;

  private nodeDataItem: string = 'NodeDataItem';

  private nodeDataTitle: string = 'NodeDataTitle';

  private nodeDataTitleNoChild: string = 'NodeDataTitleNoChild';

  private _onDidChangeTreeData: EventEmitter<NodeData | undefined | void> = new EventEmitter<NodeData | undefined | void>();

  constructor(public readonly context: ExtensionContext) {
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  getLibTree(): CustomTomlTypes {
    const curLibContent: CustomTomlTypes = {} as CustomTomlTypes;
    const cjpmContent = Utility.getTomlContent();
    for (let lib of requireCategory) {
      curLibContent[lib] = cjpmContent[lib];
    }
    // target data
    const targets = cjpmContent[TARGET];
    if (Utility.checkIsValid(targets) && Utility.checkIsValid(targets[Utility.targetOs])) {
      curLibContent[BIN_DEPENDENCIES] = targets[Utility.targetOs][BIN_DEPENDENCIES];
    }
    return curLibContent;
  }

  getTreeItem(element: NodeData): TreeItem | Promise<TreeItem> {
    return element;
  }

  recurrentCreateNode(allContent: CustomTomlTypes, content: NodeData[], parentEle: NodeData): void {
    const label: string = <string>parentEle.label;
    if (packageRequieChild.includes(label) && allContent[BIN_DEPENDENCIES] === undefined) {
      allContent[BIN_DEPENDENCIES] = {};
    }
    let libs: object = packageRequieChild.includes(label) ? allContent[BIN_DEPENDENCIES][label] : allContent[label];
    // only support ffi.c
    if (label === FFI && Utility.checkIsValid(libs)) {
      libs = allContent[label][C];
    }
    if (!Utility.checkIsValid(libs)) {
      libs = {};
    }
    if (label === 'bin-dependencies') {
      content.push(new NodeData({label: 'path-option', collapsibleState: TreeItemCollapsibleState.Collapsed}, this.nodeDataTitle, '', parentEle));
      content.push(new NodeData({label: 'package-option', collapsibleState: TreeItemCollapsibleState.Collapsed}, this.nodeDataTitle, '', parentEle));
      return;
    }
    const treeName: string[] = libs instanceof Array ? libs : Object.keys(libs);
    treeName.forEach(lib => {
      let requireItem: string = <string>libs[lib]?.path || <string>libs[lib]?.version || libs[lib] || lib;
      if (/^[a-zA-Z]:/.test(requireItem)) {
        // case1 [a-zA-Z]:/XX windows 
      } else if (Utility.checkIsValid(<string>libs[lib]?.path)) {
        requireItem = path.resolve(Utility.getCjRootProjectPath(), <string>libs[lib]?.path);
      } else if (Utility.checkIsValid(<string>libs[lib]?.git)) {
        requireItem = <string>libs[lib]?.git;
      } else if (Utility.checkIsValid(<string>libs[lib]?.version)) {
        requireItem = <string>libs[lib]?.version;
      } else {
        requireItem = '';
      }
      content.push(new NodeData({label: lib, collapsibleState: TreeItemCollapsibleState.None}, this.nodeDataItem, requireItem, parentEle));
    });
    return;
  }

  getChildren(element?: NodeData): Thenable<NodeData[]> {
    if (!Utility.isCangjieProject()) {
      return Promise.resolve(undefined);
    }
    const libContent: CustomTomlTypes = this.getLibTree();
    const content: NodeData[] = [];

    if (Utility.checkIsValid(element) && element.label === 'ffi' && Utility.getSdkOption() === 'CJVM') {
      window.showWarningMessage('the ffi is only setted up in CJNative path');
      return Promise.resolve(undefined);
    }
    if (Utility.checkIsValid(element) && requireCategoryNew.includes(<string>element.label)) {
      // when you click some treeItem
      this.recurrentCreateNode(libContent, content, element);
      return Promise.resolve(content);
    }
    // initial first time or refresh
    let keyName = Object.keys(libContent);
    for (let lib of keyName) {
      let titleName = lib === 'bin-dependencies' ? this.nodeDataTitleNoChild : this.nodeDataTitle;
      content.push(new NodeData({label: lib, collapsibleState: TreeItemCollapsibleState.Collapsed}, titleName, ''));
    }
    return Promise.resolve(content);
  }

  refresh(element?: NodeData): void {
    if (Utility.checkIsValid(element)) {
      element.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
    this._onDidChangeTreeData.fire(element);
  }
}