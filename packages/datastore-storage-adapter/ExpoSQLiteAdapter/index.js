// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
'use strict';

if (process.env.NODE_ENV === 'production') {
	module.exports = require('../dist/aws-amplify-datastore-sqlite-adapter-expo.min.js');
} else {
	module.exports = require('../dist/aws-amplify-datastore-sqlite-adapter-expo.js');
}
