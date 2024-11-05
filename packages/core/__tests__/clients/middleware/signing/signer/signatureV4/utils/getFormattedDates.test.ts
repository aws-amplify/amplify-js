// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { formattedDates, signingDate } from '../testUtils/data';
import { getFormattedDates } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getFormattedDates';

describe('getFormattedDates', () => {
	test('returns formatted dates', () => {
		const { longDate, shortDate } = formattedDates;
		expect(getFormattedDates(signingDate)).toStrictEqual({
			longDate,
			shortDate,
		});
	});
});
