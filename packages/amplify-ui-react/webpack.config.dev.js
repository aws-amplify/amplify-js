var config = require('./webpack.config.js');

var entry = {
	'@aws-amplify/ui-react': './lib/index.js',
};
module.exports = Object.assign(config, { entry, mode: 'development' });
