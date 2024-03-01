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

	it('should return the current offset if not skewed', () => {
		mockIsClockSkewed.mockReturnValue(false);
		const offset = 1500;
		expect(getUpdatedSystemClockOffset(signingDate.getTime(), offset)).toBe(
			offset,
		);
	});

	it('should return the updated offset if system clock is behind', () => {
		mockIsClockSkewed.mockReturnValue(true);
		const clockTime = new Date(signingDate);
		clockTime.setMinutes(signingDate.getMinutes() + 15);
		expect(getUpdatedSystemClockOffset(clockTime.getTime(), 0)).toBe(
			15 * 60 * 1000,
		);
	});

	it('should return the updated offset if system clock is ahead', () => {
		mockIsClockSkewed.mockReturnValue(true);
		const clockTime = new Date(signingDate);
		clockTime.setMinutes(signingDate.getMinutes() - 15);
		expect(getUpdatedSystemClockOffset(clockTime.getTime(), 0)).toBe(
			-15 * 60 * 1000,
		);
	});

	// Addresses: https://github.com/aws-amplify/amplify-js/issues/12450#issuecomment-1787945008
	it('should return the updated offset if system clock is back and forth', () => {
		// initialize client clock skew to be 15 mins behind
		mockIsClockSkewed.mockReturnValue(true);
		const clockTime = new Date(signingDate);
		clockTime.setMinutes(signingDate.getMinutes() - 15);
		let offset = getUpdatedSystemClockOffset(clockTime.getTime(), 0);
		// client clock skew is now 15 mins ahead, making it sync with server clock
		clockTime.setMinutes(clockTime.getMinutes() + 15);
		offset = getUpdatedSystemClockOffset(clockTime.getTime(), offset);
		expect(offset).toBe(0);
	});
});
