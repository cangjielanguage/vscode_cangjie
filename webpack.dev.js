/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
module.exports = [
  merge(common[0], {
    devtool: "source-map",
    optimization: {
      minimize: false
    }
  }),
  merge(common[1], {
    devtool: "source-map",
    optimization: {
      minimize: false
    }
  })
];