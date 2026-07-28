// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import Konva from 'konva/lib/Core';
import {applyNodeProps, propsKeyLength, updatePicture, W_KONVA_EVENTS_NAMESPACE} from './makeUpdates';
import {DefaultEventPriority} from 'react-reconciler/constants';

export {unstable_now as now, unstable_IdlePriority as idlePriority, unstable_runWithPriority as run} from 'scheduler';
const NOT_CONTENT = {};
const NEW_TIP = {};
Konva.Node.prototype._applyProps = applyNodeProps;

export function appendInitialChild(parentInstance, child) {
  if (typeof child === 'string') {
    return;
  }
  parentInstance.add(child);
  updatePicture(parentInstance);
}

export function createInstance(nodeType, NodeProps, instanceHandle) {
  let NodeClassName = Konva[nodeType];
  if (!NodeClassName) {
    NodeClassName = Konva.Group;
  }
  const propsOneEvents = {};
  const onEvents = {};
  Object.keys(NodeProps).forEach(nodePropsKey => {
    const requireEvent = nodePropsKey.slice(0, propsKeyLength) === 'on';
    if (requireEvent) {
      propsOneEvents[nodePropsKey] = NodeProps[nodePropsKey];
    } else {
      onEvents[nodePropsKey] = NodeProps[nodePropsKey];
    }
  });
  const example = new NodeClassName(onEvents);
  applyNodeProps(example, propsOneEvents);
  return example;
}

export function prepareForCommit() {
  return null;
}

export function createTextInstance(content, containerExample, instanceHandle) {
}

export function preparePortalMount() {
  return null;
}

export function finalizeInitialChildren(elem, node, props) {
  return false;
}

export function getChildHostContext() {
  return NOT_CONTENT;
}

export function getPublicInstance(example) {
  return example;
}

export function insertBefore(parentNode, children, oldChildren) {
  children._remove();
  parentNode.add(children);
  children.setZIndex(oldChildren.getZIndex());
  updatePicture(parentNode);
}

export function resetAfterCommit() {

}

export function prepareUpdate(elem, node, old, newArg) {
  return NEW_TIP;
}

export function resetTextContent(domElement) {

}

export const isPrimaryRenderer = false;
export const supportsMutation = true;
export const warnsIfNotActing = true;

export function getRootHostContext() {
  return NOT_CONTENT;
}

export function removeChildFromContainer(parentInstance, child) {
  child.destroy();
  child.off(W_KONVA_EVENTS_NAMESPACE);
  updatePicture(parentInstance);
}

export function shouldDeprioritizeSubtree(node, props) {
  return false;
}

export const cancelTimeout = clearTimeout;
export const noTimeout = -1;
export const scheduleTimeout = setTimeout;

export function shouldSetTextContent(type, props) {
  return false;
}

export function appendChildToContainer(parentExample, children) {
  if (children.parent === parentExample) {
    children.moveToTop();
  } else {
    parentExample.add(children);
  }
  updatePicture(parentExample);
}

export function insertInContainerBefore(parentInstance, child, beforeChild) {
  insertBefore(parentInstance, child, beforeChild);
}

export function removeChild(parentInstance, child) {
  child.destroy();
  child.off(W_KONVA_EVENTS_NAMESPACE);
  updatePicture(parentInstance);
}

export function commitTextUpdate(textInstance, oldText, newText) {
}

export function hideTextInstance(textNode) {

}

export function commitMount(node, type, newArg) {

}

export function commitUpdate(node, newPayload, type, oldArgs, newArgs) {
  applyNodeProps(node, newArgs, oldArgs);
}

export function unhideInstance(example, arg) {
  if (arg.visible == null || arg.visible) {
    example.show();
  }
}

export const getCurrentEventPriority = () => DefaultEventPriority;

export function unhideTextInstance(textInstance, text) {

}

export function hideInstance(instance) {
  instance.hide();
  updatePicture(instance);
}

export function clearContainer(container) {

}

export function detachDeletedInstance() {
}

export function appendChild(parentExample, child) {
  if (child.parent === parentExample) {
    child.moveToTop();
  } else {
    parentExample.add(child);
  }
  updatePicture(parentExample);
}
