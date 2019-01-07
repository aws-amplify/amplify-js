const path = require('path');
const pkg = require('./package.json');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        'aws-amplify-analytics': './src/index.ts',
        'aws-amplify-analytics.min': './src/index.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: pkg.name,
        libraryTarget: 'commonjs2',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /(node_modules|bower_components|dist)/,
                use: {
                    loader: 'awesome-typescript-loader'
                }
            },
            {
                test: /\.jsx?$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /(node_modules|bower_components|dist)/,
                use: {
                    loader: 'babel-loader'
                    // options: {
                    //   presets: ['@babel/preset-env']
                    // }
                }
            }
        ]
    },
    optimization: {
        minimizer: [new TerserPlugin({
            sourceMap: true
        })]
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map',
            exclude: ['./node_modules']
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 3333,
            defaultSizes: 'gzip',
            openAnalyzer: true
        })
    ]
};
