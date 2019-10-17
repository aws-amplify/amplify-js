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

import { I18n } from 'aws-amplify';

export const MapEntries = [
	['User does not exist', /user.*not.*exist/i],
	['User already exists', /user.*already.*exist/i],
	['Incorrect username or password', /incorrect.*username.*password/i],
	[
		'Invalid password format. Please make sure to use supported characters',
		/password.*constraint.*regular/i,
	],
	['Invalid username format', /username.*constraint.*regular/i],
	[
		'Invalid phone number format',
		/invalid.*phone/i,
		'Invalid phone number format. Please use a phone number format of +12345678900',
	],
];

export default message => {
	const messages = message.split(';');
	const newMessages = [];
	if (messages && messages.length) {
		messages.forEach(el => {
			const match = MapEntries.filter(entry => new RegExp(entry[1]).test(el));
			if (match.length === 0) {
				newMessages.push(I18n.get(el));
			} else {
				const entry = match[0];
				const msg = entry.length > 2 ? entry[2] : entry[0];
				newMessages.push(I18n.get(entry[0], msg));
			}
		});
	}
	return newMessages.join('; ');
};
