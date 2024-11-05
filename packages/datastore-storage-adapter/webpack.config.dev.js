var config = require('./webpack.config.js');

var entry = {
	'aws-amplify-datastore-storage-adapter': './dist/esm/index.mjs',
	'aws-amplify-datastore-sqlite-adapter-expo':
		'./dist/esm/ExpoSQLiteAdapter/ExpoSQLiteAdapter.mjs',
};
module.exports = Object.assign(config, { entry, mode: 'development' });
