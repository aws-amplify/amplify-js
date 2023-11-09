var config = require('./webpack.config.js');

var entry = {
	'aws-amplify-storage': './dist/esm/index.mjs',
};
module.exports = Object.assign(config, { entry, mode: 'development' });
