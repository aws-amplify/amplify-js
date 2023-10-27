module.exports = {
	entry: {
		'aws-amplify-auth.min': './lib-esm/index.js',
	},
	externals: [
		'react-native',
		{
			'@aws-amplify/core': 'aws_amplify_core',
		},
	],
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		library: 'aws_amplify_auth',
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
