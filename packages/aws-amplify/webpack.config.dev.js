var config = require('./webpack.config.js');

var entry = {
	'aws-amplify': [
		'./lib-esm/index.js',
		'./lib-esm/utils/index.js',
		'./lib-esm/auth/index.js',
		'./lib-esm/auth/cognito/index.js',
		'./lib-esm/storage/index.js',
		'./lib-esm/storage/s3/index.js',
	],
};
module.exports = Object.assign(config, { entry, mode: 'development' });
