// Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
// This source file is part of the Cangjie project, licensed under Apache-2.0
// with Runtime Library Exception.
//
// See https://cangjie-lang.cn/pages/LICENSE for license information.

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {DevecoMessageManager, getIdeType, MessageManager, setBackground} from '@bitfun-dap/ui-common';
import {TimelineRoot, TimelineRootProps} from './timeline/TimelineRoot';
import {StandaloneTimelineProps} from './timeline/Constants';
import {TimelinePropsType} from './message/protocol/TimelinePropsType';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

if (getIdeType() === 'Deveco') {
  // called by deveco plugin
  (window as any).sendRawMsgToWebView = function (msg: string): void {
    DevecoMessageManager.DEVECO_INSTANCE.listeners.forEach(l => l(msg));
  };
}

renderTimelineView();

function renderTimelineView(): void {
  if (getIdeType() === 'Standalone') {
    const props: TimelineRootProps = StandaloneTimelineProps;
    setBackground(getIdeType(), props.initialThemeDark);
    root.render(
      <React.StrictMode>
        <TimelineRoot
          {...props}
        />
      </React.StrictMode>
    );
  } else {
    MessageManager.instance().sendRequest(TimelinePropsType, undefined)
      .then(props => {
        const {initialRecords, isThemeDark} = props;
        setBackground(getIdeType(), isThemeDark);
        root.render(
          <React.StrictMode>
            <TimelineRoot
              initialThemeDark={isThemeDark}
              initialRecords={initialRecords}
            />
          </React.StrictMode>
        );
      })
      .catch(reason => {
        root.render(
          <h1>init timeline webview error: {reason}</h1>
        );
      });
  }
}
