// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getHashFromData } from '../../../../../src/providers/cognito/utils/srp/getHashFromData';

describe('getHashFromData', () => {
	it('Hashing a buffer returns a string', () => {
		const buf = Buffer.from('7468697320697320612074c3a97374', 'binary');
		expect(typeof getHashFromData(buf)).toBe('string');
	});
});
