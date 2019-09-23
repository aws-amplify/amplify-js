module.exports = {
	entry: {
		'aws-amplify.min': './lib-esm/index.js',
	},
	externals: [
		'@aws-amplify/analytics',
		'@aws-amplify/api',
		'@aws-amplify/auth',
		'@aws-amplify/cache',
		'@aws-amplify/core',
		'@aws-amplify/interactions',
		'@aws-amplify/pubsub',
		'@aws-amplify/storage',
		'@aws-amplify/ui',
		'@aws-amplify/xr',
	],
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		library: 'aws_amplify',
		libraryTarget: 'umd',
		umdNamedDefine: true,
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
