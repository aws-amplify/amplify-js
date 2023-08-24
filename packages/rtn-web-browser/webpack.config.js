module.exports = {
	entry: {
		'aws-amplify-rtn-web-browser.min': './lib-esm/index.js',
	},
	externals: ['react-native'],
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		library: 'aws_amplify_rtn_web_browser',
		libraryTarget: 'umd',
		umdNamedDefine: true,
		globalObject: 'this',
		devtoolModuleFilenameTemplate: require('../aws-amplify/webpack-utils')
			.devtoolModuleFilenameTemplate,
	},
	// Enable sourcemaps for debugging webpack's output.
	devtool: 'source-map',
	resolve: {
		extensions: ['.js', '.json'],
	},
	mode: 'production',
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
