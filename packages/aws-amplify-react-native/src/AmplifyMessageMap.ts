// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { I18n } from 'aws-amplify';

type MapEntry = [string, RegExp, string?];

export const MapEntries: MapEntry[] = [
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

export default (message: string) => {
	const match = MapEntries.filter(entry => entry[1].test(message));
	if (match.length === 0) {
		return message;
	}

	const entry = match[0];
	const msg = entry.length > 2 ? entry[2] : entry[0];

	return I18n.get(entry[0], msg);
};
