var config = require('./webpack.config.js');

var entry = {
	'aws-amplify': [
		'./dist/esm/index.mjs',
		'./dist/esm/utils/index.mjs',
		'./dist/esm/auth/index.mjs',
		'./dist/esm/auth/cognito/index.mjs',
		'./dist/esm/storage/index.mjs',
		'./dist/esm/storage/s3/index.mjs',
	],
};
module.exports = Object.assign(config, { entry, mode: 'development' });
