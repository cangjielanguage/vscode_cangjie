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
		extension: './src/tools-extension.ts',
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
				path.resolve(__dirname, './src/buildProject/config-set-by-ui.ts'),
				path.resolve(__dirname, './src/buildProject/require-tree-by-ui.ts')],
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
		configSetByUI: './src/buildProject/config-set-by-ui.ts',
		requireTreeByUI: './src/buildProject/require-tree-by-ui.ts',
		moduleJsonData: './src/util/cjpm-config-data.ts',
		messageData: './src/util/message-data.ts'
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

module.exports = [
  merge(extConfig, {
    devtool: false,
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    }
  }),
  merge(htmlTsConfig, {
    devtool: false,
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    }
  })
]