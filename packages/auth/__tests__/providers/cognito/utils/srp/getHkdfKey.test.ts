// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getHkdfKey } from '../../../../../src/providers/cognito/utils/srp/getHkdfKey';

describe('getHkdfKey', () => {
	it('returns a length 16 hex string', () => {
		const inputKey = Buffer.from('secretInputKey', 'ascii');
		const salt = Buffer.from('7468697320697320612074c3a97374', 'hex');
		const context = Buffer.from('Caldera Derived Key', 'utf8');
		const spacer = Buffer.from(String.fromCharCode(1), 'utf8');
		const info = new Uint8Array(context.byteLength + spacer.byteLength);
		info.set(context, 0);
		info.set(spacer, context.byteLength);

		expect(getHkdfKey(inputKey, salt, info).length).toEqual(16);
	});
});
