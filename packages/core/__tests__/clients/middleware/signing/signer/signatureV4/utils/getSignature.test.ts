// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	credentialScope,
	credentials,
	formattedDates,
	getDefaultRequest,
	signingRegion,
	signingService,
} from '../testUtils/data';
import { getSignature } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getSignature';

describe('getSignature', () => {
	test('returns signature', () => {
		const { longDate, shortDate } = formattedDates;
		const signingValues = {
			...credentials,
			credentialScope,
			longDate,
			shortDate,
			signingRegion,
			signingService,
		};
		expect(getSignature(getDefaultRequest(), signingValues)).toStrictEqual(
			'145191af25230efbe34c7eb79d9d3ce881f7a945d02d0361719107147d0086b3',
		);
	});
});
