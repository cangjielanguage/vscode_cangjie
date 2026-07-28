/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
 * This source file is part of the Cangjie project, licensed under Apache-2.0
 * with Runtime Library Exception.
 *
 * See https://cangjie-lang.cn/pages/LICENSE for license information.
 */

'use strict';

const path = require('path');
const {
	CleanWebpackPlugin
} = require('clean-webpack-plugin');
const dist_path = path.resolve(__dirname, 'out');
/**@type {import('webpack').Configuration}*/
const extConfig = {
	target: 'node',
	entry: {
		extension: './src/extensions.ts',
		worker: './src/tools/src/util/worker.ts'
	},
	output: {
		path: dist_path,
		filename: '[name].js',
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
			exclude: [
				/node_modules/,
				path.resolve(__dirname, './src/tools/src/buildProject/config-set-by-ui.ts'),
				path.resolve(__dirname, './src/tools/src/buildProject/require-tree-by-ui.ts'),
                path.resolve(__dirname, './src/dap/test'),
                path.resolve(__dirname, './src/dap/src/__mocks__')],
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
		})
	]
};

const htmlTsConfig = {
	target: 'web',
	entry: {
		configSetByUI: './src/tools/src/buildProject/config-set-by-ui.ts',
		requireTreeByUI: './src/tools/src/buildProject/require-tree-by-ui.ts',
		moduleJsonData: './src/tools/src/util/cjpm-config-data.ts',
		messageData: './src/tools/src/util/message-data.ts'
	},
	output: {
		path: path.resolve(__dirname, 'media'),
		filename: '[name].js'
	},
	module: {
		rules: [{
			test: /\.ts$/,
			use: [{
				loader: 'ts-loader'
			}]
		}]
	}
}

module.exports = [extConfig, htmlTsConfig];