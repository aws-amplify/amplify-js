module.exports = {
	entry: {
		'aws-amplify.min': [
			'./lib-esm/index.js',
			'./lib-esm/utils/index.js',
			'./lib-esm/auth/index.js',
			'./lib-esm/auth/cognito/index.js',
			'./lib-esm/storage/index.js',
			'./lib-esm/storage/s3/index.js',
		],
	},
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
