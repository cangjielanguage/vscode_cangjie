/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

'use strict';
import {FiberProvider, useContextBridge} from '../its-fine/index';
import Konva from 'konva/lib/Core';
import {LegacyRoot} from 'react-reconciler/constants';
import React from 'react';
import {applyNodeProps, toggleStrictMode} from './makeUpdates';
import * as HostConfig from './ReactKonvaHostConfig';
import ReactFiberReconciler from 'react-reconciler';

export const Arrow = 'Arrow';
export const Path = 'Path';
export const Shape = 'Shape';
export const RegularPolygon = 'RegularPolygon';

function usePrevious(num) {
  const arg = React.useRef();
  React.useLayoutEffect(() => {
    arg.current = num;
  });
  return arg.current;
}

export const TextPath = 'TextPath';
export const Line = 'Line';
export const Wedge = 'Wedge';
export const Circle = 'Circle';
export const Sprite = 'Sprite';
export const Image = 'Image';
export const Ring = 'Ring';
export const Ellipse = 'Ellipse';
export const Text = 'Text';
export const Star = 'Star';

const StageWrap = (args) => {
  const useRef = React.useRef();
  const previous = usePrevious(args);
  const ref = React.useRef();
  const content = React.useRef();
  const bridge = useContextBridge();
  const refStage = (text) => {
    const {forwardedRef} = args;
    if (!forwardedRef) {
      return;
    }
    if (typeof forwardedRef === 'function') {
      forwardedRef(text);
    } else {
      forwardedRef.current = text;
    }
  };

  React.useLayoutEffect(() => {
    useRef.current = new Konva.Stage({width: args.width, height: args.height, container: content.current});
    refStage(useRef.current);
    // @ts-ignore
    ref.current = KonvaRenderer.createContainer(useRef.current, LegacyRoot, false, null);
    KonvaRenderer.updateContainer(React.createElement(bridge, {}, args.children), ref.current);
    return () => {
      if (!Konva.isBrowser) {
        return;
      }
      refStage(null);
      KonvaRenderer.updateContainer(null, ref.current, null);
      useRef.current.destroy();
    };
  }, []);

  React.useLayoutEffect(() => {
    refStage(useRef.current);
    applyNodeProps(useRef.current, args, previous);
    KonvaRenderer.updateContainer(React.createElement(bridge, {}, args.children), ref.current, null);
  });

  return React.createElement('div', {
    ref: content, id: args.id, accessKey: args.accessKey, className: args.className,
    role: args.role, style: args.style, tabIndex: args.tabIndex, title: args.title,
  });
};

export const Transformer = 'Transformer';
export const FastLayer = 'FastLayer';
export const Layer = 'Layer';
export const Rect = 'Rect';

// @ts-ignore
export const KonvaRenderer = ReactFiberReconciler(HostConfig);
export const Group = 'Group';

KonvaRenderer.injectIntoDevTools({
  // @ts-ignore
  findHostInstanceByFiber: () => null,
  bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
  version: React.version,
  rendererPackageName: 'react-konva',
});

export const useStrictMode = toggleStrictMode;

export const Arc = 'Arc';
export const Tag = 'Tag';
export const Label = 'Label';

export const Stage = React.forwardRef((props, ref) => {
  return React.createElement(FiberProvider, {}, React.createElement(StageWrap, {...props, forwardedRef: ref}));
});
