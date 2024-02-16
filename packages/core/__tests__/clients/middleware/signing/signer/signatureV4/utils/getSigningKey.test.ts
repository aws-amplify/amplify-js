// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSigningKey } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getSigningKey';

describe('getSigningKey', () => {
	test('returns a signing key', () => {
		expect(
			getSigningKey('secret-access-key', '20200918', 'region', 'service'),
		).toStrictEqual(
			new Uint8Array([
				79, 189, 20, 186, 57, 62, 187, 22, 80, 142, 29, 192, 182, 56, 183, 254,
				40, 157, 31, 233, 13, 76, 236, 41, 206, 90, 24, 22, 52, 165, 235, 99,
			]),
		);
	});
});
