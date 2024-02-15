// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getCanonicalRequest } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getCanonicalRequest';

describe('getCanonicalRequest', () => {
	test('returns a canonical request', () => {
		const request = {
			headers: {},
			method: 'POST',
			url: new URL('https://sub.domain'),
		};
		expect(getCanonicalRequest(request)).toBe(
			'POST\n/\n\n\n\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		);
	});
});
