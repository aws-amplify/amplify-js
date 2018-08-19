var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ReactToHtmlPlugin = require('react-to-html-webpack-plugin');

var path = require('path');
var ejs = require('ejs');
var fs = require('fs');

module.exports = {
  // entry: './src/index.js',

  // output: {
  //   filename: 'index.js',
  //   path: path.resolve('./dist'),
  //   libraryTarget: 'umd'
  // },

  entry: {
    'aws-amplify-ui': './src/index.js',
    'aws-amplify-ui.min': './src/index.js'
  },
  output: {
      filename: '[name].js',
      path: __dirname + '/dist',
      library: 'aws_amplify_ui',
      libraryTarget: 'umd',
      umdNamedDefine: true
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',
  resolve: {
      extensions: ['.js', '.css']
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader') },
      { test: /\.svg$/, loader: "url-loader?limit=10000&mimetype=image/svg+xml" }
    ]
  },

  postcss: [
    require('autoprefixer-core'),
    require('postcss-color-rebeccapurple')
  ],

  resolve: {
    modulesDirectories: ['node_modules', 'components']
  },

  plugins: [
    new ExtractTextPlugin('style.css', { allChunks: true }),
    // new ReactToHtmlPlugin('index.html', 'index.js', {
    //   static: true,
    //   template: ejs.compile(fs.readFileSync(__dirname + '/src/template.ejs', 'utf-8'))
    // })
  ]
};