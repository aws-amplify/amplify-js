var config = require('./webpack.config.js');

var entry = {
    'aws-amplify-cache': './cjs/index.js'
};
module.exports = Object.assign(config, { entry, mode: 'development' });
