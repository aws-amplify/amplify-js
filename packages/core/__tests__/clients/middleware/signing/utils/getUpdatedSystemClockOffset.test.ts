// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getUpdatedSystemClockOffset } from '../../../../../src/clients/middleware/signing/utils/getUpdatedSystemClockOffset';
import { isClockSkewed } from '../../../../../src/clients/middleware/signing/utils/isClockSkewed';
import { signingDate } from '../signer/signatureV4/testUtils/data';

jest.mock('../../../../../src/clients/middleware/signing/utils/isClockSkewed');

const mockIsClockSkewed = isClockSkewed as jest.Mock;

describe('getUpdatedSystemClockOffset', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		Date.now = jest.fn(() => signingDate.valueOf());
	});

	test('returns the current offset if not skewed', () => {
		mockIsClockSkewed.mockReturnValue(false);
		const offset = 1500;
		expect(getUpdatedSystemClockOffset(signingDate.getTime(), offset)).toBe(
			offset
		);
	});

	test('returns the updated offset if system clock is behind', () => {
		mockIsClockSkewed.mockReturnValue(true);
		const clockTime = new Date(signingDate);
		clockTime.setMinutes(signingDate.getMinutes() + 15);
		expect(getUpdatedSystemClockOffset(clockTime.getTime(), 0)).toBe(
			15 * 60 * 1000
		);
	});

	test('returns the updated offset if system clock is ahead', () => {
		mockIsClockSkewed.mockReturnValue(true);
		const clockTime = new Date(signingDate);
		clockTime.setMinutes(signingDate.getMinutes() - 15);
		expect(getUpdatedSystemClockOffset(clockTime.getTime(), 0)).toBe(
			-15 * 60 * 1000
		);
	});
});
