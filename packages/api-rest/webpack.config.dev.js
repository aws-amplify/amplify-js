var config = require('./webpack.config.js');

var entry = {
	'aws-amplify-api-rest': './dist/esm/index.mjs',
};
module.exports = Object.assign(config, { entry, mode: 'development' });
