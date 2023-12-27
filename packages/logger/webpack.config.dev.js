var config = require('./webpack.config.js');

var entry = {
	'aws-amplify-logger': './dist/esm/index.mjs',
};
module.exports = Object.assign(config, { entry, mode: 'development' });
