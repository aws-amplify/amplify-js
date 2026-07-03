module.exports = {
	entry: {
		'aws-amplify-core.min': './lib-esm/index.js',
	},
	externals: ['aws-sdk/global'],
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		library: 'aws_amplify_core',
		libraryTarget: 'umd',
		umdNamedDefine: true,
		globalObject: 'this',
		// The modern @aws-sdk/@smithy runtime causes webpack 5 to emit its
		// "automatic publicPath" detection, which throws ("Automatic publicPath is
		// not supported in this browser") when there is no script URL (e.g. jsdom,
		// SSR). This UMD bundle loads no dynamic chunks, so pin publicPath to ''.
		publicPath: '',
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
			// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			//{ enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
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
