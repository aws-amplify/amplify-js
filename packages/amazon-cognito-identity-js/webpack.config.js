// Webpack version: ^4.46.0
const TerserPlugin = require('terser-webpack-plugin');

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
		new webpack.BannerPlugin({ banner, raw: true })
	],
	optimization: {
		minimizer: [
			new TerserPlugin({
				sourceMap: true,
				terserOptions: {
					compress: true
				},
				include: /\.min\.js$/,
			})
		]
	},
	mode: 'production',
	module: {
		rules: [
			// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			//{ enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
		],
	},
};

module.exports = config;
