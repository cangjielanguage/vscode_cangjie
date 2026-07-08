/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

import {RequestResponseType} from "./request-response-type";

export class RequestHandler<REQ_BODY, RESP_BODY> {
  type: RequestResponseType<REQ_BODY, RESP_BODY>;
  handler: (req: REQ_BODY) => Promise<RESP_BODY>;

  constructor(type: RequestResponseType<REQ_BODY, RESP_BODY>, handler: (req: REQ_BODY) => Promise<RESP_BODY>) {
    this.type = type;
    this.handler = handler;
  }
}