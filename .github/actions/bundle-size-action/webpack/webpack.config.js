const glob = require('glob');
const { basename } = require('path');

module.exports = {
	entry: glob.sync('./src/*.js').reduce((acc, path) => {
		acc[basename(path)] = path;

		return acc;
	}, {}),

	mode: 'production',

	// https://github.com/aws-amplify/amplify-js/issues/7454
	// https://github.com/aws-amplify/amplify-js/issues/7185
	module: {
		rules: [
			{
				test: /\.m?jsx?$/,
				resolve: {
					fallback: {
						crypto: false,
					},
					fullySpecified: false,
				},
			},
		],
	},

	output: {
		filename: '[name].min.js',
	},

	target: 'web',
};
