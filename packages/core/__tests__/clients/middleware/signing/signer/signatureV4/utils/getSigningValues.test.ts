// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	credentialScope,
	credentialsWithToken,
	formattedDates,
	signingDate,
	signingRegion,
	signingService,
} from '../testUtils/data';
import { getSigningValues } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getSigningValues';

describe('getSigningValues', () => {
	test('returns signing values', () => {
		const { longDate, shortDate } = formattedDates;
		expect(
			getSigningValues({
				credentials: credentialsWithToken,
				signingDate,
				signingRegion,
				signingService,
			})
		).toStrictEqual({
			...credentialsWithToken,
			credentialScope,
			longDate,
			shortDate,
			signingRegion,
			signingService,
			uriEscapePath: true,
		});
	});
});
