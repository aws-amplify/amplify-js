// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSkewCorrectedDate } from '../../../../../src/clients/middleware/signing/utils/getSkewCorrectedDate';
import { isClockSkewed } from '../../../../../src/clients/middleware/signing/utils/isClockSkewed';
import { signingDate } from '../signer/signatureV4/testUtils/data';

jest.mock(
	'../../../../../src/clients/middleware/signing/utils/getSkewCorrectedDate'
);

const mockGetSkewCorrectedDate = getSkewCorrectedDate as jest.Mock;

describe('isClockSkewed', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	test('returns true if system clock is too far behind', () => {
		const clockTime = new Date(signingDate);
		mockGetSkewCorrectedDate.mockReturnValue(signingDate);

		clockTime.setMinutes(signingDate.getMinutes() + 5);
		expect(isClockSkewed(clockTime.getTime(), 0)).toBe(true);
	});

	test('returns true if system clock is too far ahead', () => {
		const clockTime = new Date(signingDate);
		mockGetSkewCorrectedDate.mockReturnValue(signingDate);

		clockTime.setMinutes(signingDate.getMinutes() - 5);
		expect(isClockSkewed(clockTime.getTime(), 0)).toBe(true);
	});

	test('returns false if clock skew is within tolerance', () => {
		const clockTime = new Date(signingDate);
		mockGetSkewCorrectedDate.mockReturnValue(signingDate);

		clockTime.setMinutes(signingDate.getMinutes() + 4);
		expect(isClockSkewed(clockTime.getTime(), 0)).toBe(false);

		clockTime.setMinutes(signingDate.getMinutes() - 4);
		expect(isClockSkewed(clockTime.getTime(), 0)).toBe(false);
	});
});
