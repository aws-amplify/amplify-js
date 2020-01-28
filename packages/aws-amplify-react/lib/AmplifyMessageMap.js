'use strict';
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
Object.defineProperty(exports, '__esModule', { value: true });
var core_1 = require('@aws-amplify/core');
exports.MapEntries = [
	['User does not exist', /user.*not.*exist/i],
	['User already exists', /user.*already.*exist/i],
	['Incorrect username or password', /incorrect.*username.*password/i],
	['Invalid password format', /validation.*password/i],
	[
		'Invalid phone number format',
		/invalid.*phone/i,
		'Invalid phone number format. Please use a phone number format of +12345678900',
	],
];
function AmplifyMessageMap(message) {
	// @ts-ignore
	var match = exports.MapEntries.filter(function(entry) {
		return entry[1].test(message);
	});
	if (match.length === 0) {
		return message;
	}
	var entry = match[0];
	var msg = entry.length > 2 ? entry[2] : entry[0];
	return core_1.I18n.get(entry[0], msg);
}
exports.default = AmplifyMessageMap;
//# sourceMappingURL=AmplifyMessageMap.js.map
