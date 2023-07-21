var config = require('./webpack.config.js');

var entry = {
	'aws-amplify': [
		'./lib-esm/index.js',
		'./lib-esm/utils/index.js',
		'./lib-esm/categories/auth/index.js',
	],
};
module.exports = Object.assign(config, { entry, mode: 'development' });
