// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { credentialScope, formattedDates } from '../testUtils/data';
import { getStringToSign } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getStringToSign';

describe('getStringToSign', () => {
	test('returns signature', () => {
		expect(
			getStringToSign(
				formattedDates.longDate,
				credentialScope,
				'hashed-request'
			)
		).toStrictEqual(
			'AWS4-HMAC-SHA256\n20200918T181818Z\n20200918/signing-region/signing-service/aws4_request\nhashed-request'
		);
	});
});
