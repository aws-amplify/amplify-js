// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSkewCorrectedDate } from '../../../../../src/clients/middleware/signing/utils/getSkewCorrectedDate';
import { signingDate } from '../signer/signatureV4/testUtils/data';

describe('getSkewCorrectedDate', () => {
	test('gets current time but with offset', () => {
		Date.now = jest.fn(() => signingDate.valueOf());
		expect(getSkewCorrectedDate(0)).toStrictEqual(signingDate);

		const expectedDate = new Date(signingDate);
		expectedDate.setSeconds(signingDate.getSeconds() + 30);
		expect(getSkewCorrectedDate(30 * 1000)).toStrictEqual(expectedDate);
	});
});
