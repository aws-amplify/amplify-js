/* eslint-disable */
var webpack = require('webpack');

var banner = '/*!\n' +
' * Copyright 2016 Amazon.com,\n' +
' * Inc. or its affiliates. All Rights Reserved.\n' +
' * \n' +
' * Licensed under the Amazon Software License (the "License").\n' +
' * You may not use this file except in compliance with the\n' +
' * License. A copy of the License is located at\n' +
' * \n' +
' *     http://aws.amazon.com/asl/\n' +
' * \n' +
' * or in the "license" file accompanying this file. This file is\n' +
' * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR\n' +
' * CONDITIONS OF ANY KIND, express or implied. See the License\n' +
' * for the specific language governing permissions and\n' +
' * limitations under the License. \n' +
' */\n\n';

var config = {
  entry: './src/index.js',
  output: {
    libraryTarget: 'umd',
    library: 'AmazonCognitoIdentity'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.BannerPlugin(banner, { raw: true })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: './node_modules/.cache/babel'
        }
      }
    ]
  }
};

if (process.env.NODE_ENV === 'production') {
  config.devtool = 'source-map';
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  );
}

module.exports = config;
