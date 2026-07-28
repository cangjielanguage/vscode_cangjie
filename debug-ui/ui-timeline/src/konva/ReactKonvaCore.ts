// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import * as ReactReconciler from 'react-reconciler';
import * as React from 'react';
import Konva from 'konva';

export declare const Group: KonvaNodeComponent<Konva.Group, Konva.GroupConfig>;
export declare const Label: KonvaNodeComponent<Konva.Label, Konva.LabelConfig>;

export declare const Ring: KonvaNodeComponent<Konva.Ring, Konva.RingConfig>;
export declare const Path: KonvaNodeComponent<Konva.Path, Konva.PathConfig>;
export declare const Arc: KonvaNodeComponent<Konva.Arc, Konva.ArcConfig>;
export declare const Tag: KonvaNodeComponent<Konva.Tag, Konva.TagConfig>;
export declare const Star: KonvaNodeComponent<Konva.Star, Konva.StarConfig>;

export interface KonvaNodeComponent<Node extends Konva.Node, Props = Konva.NodeConfig>
  extends React.FC<Props & KonvaNodeEvents & React.ClassAttributes<Node>> {
  getNativeNode: () => Node;
  getPublicInstance: () => Node;
}

export declare const Stage: KonvaNodeComponent<Konva.Stage, StageProps>;
export declare const Konletenderer: ReactReconciler.Reconciler<any, any, any, any, any>;
export declare const FastLayer: KonvaNodeComponent<Konva.FastLayer, Konva.LayerConfig>;
export declare const Layer: KonvaNodeComponent<Konva.Layer, Konva.LayerConfig>;

export interface KonvaNodeEvents {
  onMouseLeave?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onPointerDown?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onMouseMove?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseOut?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseDown?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseEnter?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseOver?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onPointerMove?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onTouchMove?: (evt: Konva.KonvaEventObject<TouchEvent>) => void;
  onClick?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onDblTap?: (evt: Konva.KonvaEventObject<Event>) => void;
  onDragMove?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
  onDragStart?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
  onContextMenu?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onTransform?: (evt: Konva.KonvaEventObject<Event>) => void;
  onPointerDblClick?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onPointerClick?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onTouchStart?: (evt: Konva.KonvaEventObject<TouchEvent>) => void;
  onTransformStart?: (evt: Konva.KonvaEventObject<Event>) => void;
  onPointerLeave?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onLostPointerCapture?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onPointerUp?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onTransformEnd?: (evt: Konva.KonvaEventObject<Event>) => void;
  onPointerCancel?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onPointerEnter?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onGotPointerCapture?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onDragEnd?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
  onPointerOver?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onWheel?: (evt: Konva.KonvaEventObject<WheelEvent>) => void;
  onDblClick?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onPointerOut?: (evt: Konva.KonvaEventObject<PointerEvent>) => void;
  onTouchEnd?: (evt: Konva.KonvaEventObject<TouchEvent>) => void;
  onTap?: (evt: Konva.KonvaEventObject<Event>) => void;
}

export declare const Transformer: KonvaNodeComponent<Konva.Transformer, Konva.TransformerConfig>;
export declare const Rect: KonvaNodeComponent<Konva.Rect, Konva.RectConfig>;
export declare const Ellipse: KonvaNodeComponent<Konva.Ellipse, Konva.EllipseConfig>;
export declare const Wedge: KonvaNodeComponent<Konva.Wedge, Konva.WedgeConfig>;
export declare const Circle: KonvaNodeComponent<Konva.Circle, Konva.CircleConfig>;

export declare const useStrictMode: (useStrictMode: boolean) => void;

export interface StageProps extends Konva.NodeConfig, KonvaNodeEvents,
  Pick<React.HTMLAttributes<HTMLDivElement>, 'tabIndex' | 'title' | 'style' | 'className' | 'role'> {}

export declare const TextPath: KonvaNodeComponent<Konva.TextPath, Konva.TextPathConfig>;
export declare const Sprite: KonvaNodeComponent<Konva.Sprite, Konva.SpriteConfig>;
export declare const Line: KonvaNodeComponent<Konva.Line, Konva.LineConfig>;
export declare const Text: KonvaNodeComponent<Konva.Text, Konva.TextConfig>;
export declare const Image: KonvaNodeComponent<Konva.Image, Konva.ImageConfig>;
export declare const Shape: KonvaNodeComponent<Konva.Shape, Konva.ShapeConfig>;
export declare const Arrow: KonvaNodeComponent<Konva.Arrow, Konva.ArrowConfig>;
export declare const RegularPolygon: KonvaNodeComponent<Konva.RegularPolygon, Konva.RegularPolygonConfig>;
