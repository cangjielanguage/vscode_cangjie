// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import {Konva} from 'konva/lib/Global';

const skipProps = {
  unstableApplyDrawHitFromCache: true,
  ref: true,
  key: true,
  forwardedRef: true,
  style: true,
  unstableApplyCache: true,
  children: true,
};
let dragWarning = false;
let indexShowedWarning = false;
let requireStrictMode = false;

export function toggleStrictMode(value) {
  requireStrictMode = value;
}

export const W_KONVA_EVENTS_NAMESPACE = '.react-konva-event';
const DRAGGABLE_WARNING = 'ReactKonva warning';
const Z_INDEX_WARNING = 'ReactKonva index warning';
const EMPTY_PROPS = {};

export const propsKeyLength = 2;
const evNameSplit = 7;
const evNameSplitNext = 8;

function updateProps(oldProps, props, instance) {
  // check old props
  // we need to unset properties that are not in new props
  // and remove all events
  for (let key in oldProps) {
    if (skipProps[key]) {
      continue;
    }
    let judgeEvent = key.slice(0, propsKeyLength) === 'on';
    let isChangedProps = oldProps[key] !== props[key];
    // if that is a changed event, we need to remove it
    if (judgeEvent && isChangedProps) {
      let evName = key.substr(propsKeyLength).toLowerCase();
      if (evName.substr(0, evNameSplit) === 'content') {
        evName =
          `content${evName.substr(evNameSplit, 1).toUpperCase()}${evName.substr(evNameSplitNext)}`;
      }
      instance.off(evName, oldProps[key]);
    }
    let doDelete = !Object.prototype.hasOwnProperty.call(props, key);
    if (doDelete) {
      instance.setAttr(key, undefined);
    }
  }
}

function addNewProps(props, oldProps, instance) {
  let isNewStrictMode = toggleStrictMode || props._useStrictMode;
  let isNew = false;
  let newProps = {};
  const newEvs = {};
  for (let keyProps in props) {
    if (skipProps[keyProps]) {
      continue;
    }
    let isEnt = keyProps.slice(0, propsKeyLength) === 'on';
    let toAdd = oldProps[keyProps] !== props[keyProps];
    if (isEnt && toAdd) {
      let entName = keyProps.substr(propsKeyLength).toLowerCase();
      if (entName.substr(0, evNameSplit) === 'content') {
        entName = `content${entName.substr(evNameSplit, 1).toUpperCase()}${entName.substr(evNameSplitNext)}`;
      }
      // check that event is not undefined
      if (props[keyProps]) {
        newEvs[entName] = props[keyProps];
      }
    }
    const isNewFlag = !isEnt &&
      (props[keyProps] !== oldProps[keyProps] ||
        (isNewStrictMode && props[keyProps] !== instance.getAttr(keyProps)));
    if (isNewFlag) {
      isNew = true;
      newProps[keyProps] = props[keyProps];
    }
  }
  if (isNew) {
    instance.setAttrs(newProps);
    updatePicture(instance);
  }
  // subscribe to events AFTER we set attrs
  // we need it to fix https://github.com/konvajs/react-konva/issues/471
  // settings attrs may add events. Like "draggable: true" will add "mousedown" listener
  Object.keys(newEvs).forEach(eventName => instance.on(eventName + W_KONVA_EVENTS_NAMESPACE, newEvs[eventName]));
}

export function applyNodeProps(instance, props, oldProps = EMPTY_PROPS) {
  // don't use zIndex in react-konva
  if (!indexShowedWarning && 'zIndex' in props) {
    indexShowedWarning = true;
  }
  // check correct draggable usage
  if (!dragWarning && props.draggable) {
    let hasPosition = props.x !== undefined || props.y !== undefined;
    let hasEvents = props.onDragEnd || props.onDragMove;
    if (hasPosition && !hasEvents) {
      dragWarning = true;
    }
  }
  updateProps(oldProps, props, instance);
  addNewProps(props, oldProps, instance);
}

export function updatePicture(node) {
  if (!Konva.autoDrawEnabled) {
    let drawingNode = node.getLayer() || node.getStage();
    if (drawingNode) {
      drawingNode.batchDraw();
    }
  }
}
