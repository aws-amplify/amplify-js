// version 3.11.0
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

/* eslint-disable */
var webpack = require('webpack');

var banner =
	'/*!\n' +
	' * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.\n' +
	' * SPDX-License-Identifier: Apache-2.0\n' +
	' */\n\n';

var config = {
	entry: {
		'amazon-cognito-identity': './src/index.js',
		'amazon-cognito-identity.min': './src/index.js',
	},
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		libraryTarget: 'umd',
		library: 'AmazonCognitoIdentity',
		devtoolModuleFilenameTemplate: require('../aws-amplify/webpack-utils')
			.devtoolModuleFilenameTemplate,
	},
	externals: {
		crypto: 'crypto',
	},
	plugins: [
		// removed OccurrenceOrderPlugin as it is on by default: https://webpack.js.org/migrate/3/#occurrenceorderplugin-is-now-on-by-default
		new webpack.BannerPlugin({ banner, raw: true }),
		new UglifyJsPlugin({
			minimize: true,
			sourceMap: true,
			include: /\.min\.js$/,
		}),
		new CompressionPlugin({
			include: /\.min\.js$/,
		}),
	],
	module: {
		rules: [
			// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			//{ enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				// rule.query deprecated: https://webpack.js.org/configuration/module/#ruleoptions--rulequery
				// using the babel-loader: https://webpack.js.org/loaders/babel-loader/
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
					}
				},
			},
		],
	},
};

module.exports = config;
