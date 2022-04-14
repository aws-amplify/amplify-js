module.exports = {
	entry: {
		'aws-amplify-react.min': './lib/index.js',
	},
	externals: [
		'@aws-amplify/auth',
		'@aws-amplify/analytics',
		'@aws-amplify/api',
		'@aws-amplify/core',
		'@aws-amplify/interactions',
		'@aws-amplify/storage',
		'@aws-amplify/ui',
		'@aws-amplify/ui/dist/style.css',
		'@aws-amplify/xr',
		'aws-amplify',
		'react',
	],
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		library: 'aws_amplify_react',
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
		fallback: {fs: false},
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
	// node: {
	// 	fs: 'empty',
	// },
};
