const glob = require('glob');
const { basename } = require('path');

module.exports = {
	entry: glob.sync('./src/*.js').reduce((acc, path) => {
		acc[basename(path)] = path;

		return acc;
	}, {}),

	mode: 'production',

	output: {
		filename: '[name].min.js',
	},

	target: 'web',
};
