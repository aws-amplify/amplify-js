var config = require('./webpack.config.js');

var entry = {
    'aws-amplify-xr': './esm/index.js'
};
module.exports = Object.assign(config, { entry, mode: 'development' });
