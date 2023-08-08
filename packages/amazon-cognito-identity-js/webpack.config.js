const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");

/* eslint-disable */
var webpack = require('webpack');

var banner =
	'/*!\n' +
	' * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.\n' +
	' * SPDX-License-Identifier: Apache-2.0\n' +
	' */\n\n';

module.exports = {
	entry: {
		'amazon-cognito-identity': './src/index.js',
		'amazon-cognito-identity.min': './src/index.js',
	},
	externals: {
		crypto: 'crypto',
	},
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		libraryTarget: 'umd',
		library: 'AmazonCognitoIdentity',
		devtoolModuleFilenameTemplate: require('../aws-amplify/webpack-utils')
			.devtoolModuleFilenameTemplate,
	},
	resolve: {
		extensions: ['.js', '.json'],
	},
	mode: 'production',
	plugins: [
		new webpack.BannerPlugin({ banner, raw: true }),
		new CompressionPlugin({
			include: /\.min\.js$/,
		})
	],
	optimization: {
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				terserOptions: {
					compress: true,
					sourceMap: true,
				},
				include: /\.min\.js$/,
			})
		]
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: /node_modules/,
				use: [
					'babel-loader',
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
						},
					},
				],
			},
		],
	},
};
