module.exports = {
	entry: {
		'aws-amplify-api-graphql.min': './lib-esm/index.js',
	},
	externals: [
		'graphql',
		'graphql/language/ast',
		'graphql/language/parser',
		'graphql/language/printer',
		{
			'@aws-amplify/auth': 'aws_amplify_auth',
			'@aws-amplify/cache': 'aws_amplify_cache',
			'@aws-amplify/core': 'aws_amplify_core',
		},
	],
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		library: 'aws_amplify_api-graphql',
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
