module.exports = {
	entry: {
		'aws-amplify-datastore-storage-adapter.min': './dist/esm/index.mjs',
		'aws-amplify-datastore-sqlite-adapter-expo.min':
			'./dist/esm/ExpoSQLiteAdapter/ExpoSQLiteAdapter.mjs',
	},
	externals: [
		'@aws-amplify/datastore',
		'@aws-amplify/core',
		'expo-file-system',
		'expo-sqlite',
		'react-native-sqlite-storage',
	],
	output: {
		filename: '[name].js',
		path: __dirname + '/dist/umd',
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
