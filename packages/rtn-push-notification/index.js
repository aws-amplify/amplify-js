'use strict';

if (process.env.NODE_ENV === 'production') {
	module.exports = require('./dist/aws-amplify-rtn-push-notification.min.js');
} else {
	module.exports = require('./dist/aws-amplify-rtn-push-notification.js');
}
