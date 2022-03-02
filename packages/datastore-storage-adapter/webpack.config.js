module.exports = {
	entry: {
		'aws-amplify-datastore-storage-adapter.min': './lib-esm/index.js',
	},
	externals: [
		'@aws-amplify/datastore',
		'@aws-amplify/core',
		'react-native-sqlite-storage',
		'expo-sqlite',
		'expo-file-system',
	],
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		library: 'aws-amplify-datastore-storage-adapter',
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
