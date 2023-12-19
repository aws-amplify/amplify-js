module.exports = {
	entry: {
		'aws-amplify.min': [
			'./dist/esm/index.mjs',
			'./dist/esm/utils/index.mjs',
			'./dist/esm/auth/index.mjs',
			'./dist/esm/auth/cognito/index.mjs',
			'./dist/esm/storage/index.mjs',
			'./dist/esm/storage/s3/index.mjs',
		],
	},
	output: {
		filename: '[name].js',
		path: __dirname + '/dist/umd',
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
