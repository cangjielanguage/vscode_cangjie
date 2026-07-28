/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

const {
	CleanWebpackPlugin
} = require('clean-webpack-plugin');
const path = require('path');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const dist_path = path.resolve(__dirname, 'out');
const extConfig = {
	target: 'node',
	entry: {
		dap: './launch-dap.ts',
	},
	output: {
		path: dist_path,
		filename: 'extension.js',
		libraryTarget: 'commonjs2',
		devtoolModuleFilenameTemplate: '../[resource-path]'
	},
	externals: {
		vscode: 'commonjs vscode'
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [{
			test: /\.ts$/,
			exclude:[
				path.resolve(__dirname, './node_modules'),
                path.resolve(__dirname, './test'),
                path.resolve(__dirname, './src/__mocks__')
			],
			use: [{
				loader: 'ts-loader'
			}]
		}]
	},
	devtool: false,
	plugins: [
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: [
				dist_path.toString()
			]
		}),
	]
};
module.exports = [
  merge(extConfig, {
    devtool: false,
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    }
  })
]