module.exports = {
	entry: {
		'aws-amplify.min': './lib-esm/index.js',
	},
	externals: [
		{
			'@aws-amplify/pubsub': 'aws_amplify_pubsub',
			'@aws-amplify/cache': 'aws_amplify_cache',
			'@aws-amplify/auth': 'aws_amplify_auth',
			'@aws-amplify/core': 'aws_amplify_core',
			'@aws-amplify/api': 'aws_amplify_api',
			'@aws-amplify/api-graphql': 'aws_amplify_api-graphql',
			'@aws-amplify/datastore': 'aws_amplify_datastore',
			'@aws-amplify/interactions': 'aws_amplify_interactions',
			'@aws-amplify/geo': 'aws_amplify_geo',
			'@aws-amplify/storage': 'aws_amplify_storage',
			'@aws-amplify/analytics': 'aws_amplify_analytics',
			'@aws-amplify/predictions': 'aws_amplify_predictions',
			'@aws-amplify/notifications': 'aws_amplify_notifications',
			'@aws-amplify/xr': 'aws_amplify_xr',
		},
	],
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		library: 'aws_amplify',
		libraryTarget: 'umd',
		umdNamedDefine: true,
		globalObject: 'this',
		devtoolModuleFilenameTemplate: require('../aws-amplify/webpack-utils')
			.devtoolModuleFilenameTemplate,
	},
	// Enable sourcemaps for debugging webpack's output.
	devtool: 'source-map',
	resolve: {
		extensions: ['.mjs', '.js', '.json'],
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
