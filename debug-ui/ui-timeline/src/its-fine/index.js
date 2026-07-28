// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import * as React from 'react';

let __defProp = Object.defineProperty;
let __defProps = Object.defineProperties;
let __getOwnPropDescs = Object.getOwnPropertyDescriptors;
let __getOwnPropSymbols = Object.getOwnPropertySymbols;
let __hasOwnProp = Object.prototype.hasOwnProperty;
let __propIsEnum = Object.prototype.propertyIsEnumerable;
let __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value,
}) : obj[key] = value;
let __spreadValues = (a, b) => {
  for (let prop in b || (b = {})) {
    if (__hasOwnProp.call(b, prop)) {
      __defNormalProp(a, prop, b[prop]);
    }
  }
  if (__getOwnPropSymbols) {
    for (let prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop)) {
        __defNormalProp(a, prop, b[prop]);
      }
    }
  }
  return a;
};
let __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

function traverseFiber(fiber, ascending, selector) {
  if (!fiber) {
    return;
  }
  if (selector(fiber) === true) {
    return fiber;
  }
  let child = ascending ? fiber.return : fiber.child;
  while (child) {
    const match = traverseFiber(child, ascending, selector);
    if (match) {
      return match;
    }
    child = ascending ? null : child.sibling;
  }
}

function wrapContext(context) {
  try {
    return Object.defineProperties(context, {
      _currentRenderer: {
        get() {
          return null;
        },
        set() {
        },
      },
      _currentRenderer2: {
        get() {
          return null;
        },
        set() {
        },
      },
    });
  } catch (_) {
    return context;
  }
}

const FiberContext = wrapContext(React.createContext(null));

class FiberProvider extends React.Component {
  render() {
    return /* @__PURE__ */ React.createElement(FiberContext.Provider, {
      value: this._reactInternals,
    }, this.props.children);
  }
}

const {ReactCurrentOwner, ReactCurrentDispatcher} = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

function useFiber() {
  const root = React.useContext(FiberContext);
  if (root === null) {
    throw new Error('its-fine: useFiber must be called within a <FiberProvider />!');
  }
  const id = React.useId();
  const fiber = React.useMemo(() => {
    for (const maybeFiber of [ReactCurrentOwner == null ? void 0 : ReactCurrentOwner.current, root, root == null ? void 0 : root.alternate]) {
      if (!maybeFiber) {
        continue;
      }
      const fiber2 = traverseFiber(maybeFiber, false, (node) => {
        let state = node.memoizedState;
        while (state) {
          if (state.memoizedState === id) {
            return true;
          }
          state = state.next;
        }
      });
      if (fiber2) {
        return fiber2;
      }
    }
  }, [root, id]);
  return fiber;
}

function useContainer() {
  const fiber = useFiber();
  const root = React.useMemo(
    () => traverseFiber(fiber, true, (node) => {
      let _a;
      return ((_a = node.stateNode) == null ? void 0 : _a.containerInfo) != null;
    }),
    [fiber]
  );
  return root == null ? void 0 : root.stateNode.containerInfo;
}

function useNearestChild(type) {
  const fiber = useFiber();
  const childRef = React.useRef();
  React.useLayoutEffect(() => {
    let _a;
    childRef.current = (_a = traverseFiber(
      fiber,
      false,
      (node) => typeof node.type === 'string' && (type === void 0 || node.type === type)
    )) == null ? void 0 : _a.stateNode;
  }, [fiber]);
  return childRef;
}

function useNearestParent(type) {
  const fiber = useFiber();
  const parentRef = React.useRef();
  React.useLayoutEffect(() => {
    let _a;
    parentRef.current = (_a = traverseFiber(
      fiber,
      true,
      (node) => typeof node.type === 'string' && (type === void 0 || node.type === type)
    )) == null ? void 0 : _a.stateNode;
  }, [fiber]);
  return parentRef;
}

function useContextMap() {
  let _a;
  let _b;
  const fiber = useFiber();
  const [contextMap] = React.useState(() => /* @__PURE__ */ new Map());
  contextMap.clear();
  let node = fiber;
  while (node) {
    const context = (_a = node.type) == null ? void 0 : _a._context;
    if (context && context !== FiberContext && !contextMap.has(context)) {
      contextMap.set(context, (_b = ReactCurrentDispatcher == null ? void 0 :
        ReactCurrentDispatcher.current) == null ? void 0 : _b.readContext(wrapContext(context)));
    }
    node = node.return;
  }
  return contextMap;
}

function useContextBridge() {
  const contextMap = useContextMap();
  return React.useMemo(
    () => Array.from(contextMap.keys()).reduce(
      (Prev, context) => (props) =>
        /* @__PURE__ */ React.createElement(Prev, null, /* @__PURE__ */
          React.createElement(context.Provider, __spreadProps(__spreadValues({}, props), {
            value: contextMap.get(context),
          }))),
      (props) => /* @__PURE__ */ React.createElement(FiberProvider, __spreadValues({}, props))
    ),
    [contextMap]
  );
}

export {
  FiberProvider,
  traverseFiber,
  useContainer,
  useContextBridge,
  useContextMap,
  useFiber,
  useNearestChild,
  useNearestParent
};
