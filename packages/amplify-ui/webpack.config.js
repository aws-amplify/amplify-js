var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
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
  ]
};