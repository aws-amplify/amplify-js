module.exports = {
	entry: {
		'aws-amplify-datastore.min': './dist/esm/index.mjs',
	},
	externals: [{ '@aws-amplify/pubsub': 'aws_amplify_pubsub' }],
	output: {
		filename: '[name].js',
		path: __dirname + '/dist/umd',
		library: 'aws_amplify_datastore',
		libraryTarget: 'umd',
		umdNamedDefine: true,
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
