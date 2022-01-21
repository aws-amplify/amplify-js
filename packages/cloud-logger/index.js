'use strict';

if (process.env.NODE_ENV === 'production') {
	module.exports = require('./dist/aws-amplify-cloud-logger.min.js');
} else {
	module.exports = require('./dist/aws-amplify-cloud-logger.js');
}
