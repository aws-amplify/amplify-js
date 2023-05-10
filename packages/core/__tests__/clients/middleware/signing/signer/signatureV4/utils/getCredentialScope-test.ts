// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	credentialScope,
	formattedDates,
	signingRegion,
	signingService,
} from '../testUtils/data';
import { getCredentialScope } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getCredentialScope';

describe('getCredentialScope', () => {
	test('returns a credential scope', () => {
		expect(
			getCredentialScope(
				formattedDates.shortDate,
				signingRegion,
				signingService
			)
		).toBe(credentialScope);
	});
});
