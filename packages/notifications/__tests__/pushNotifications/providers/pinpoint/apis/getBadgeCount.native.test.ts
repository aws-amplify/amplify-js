// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertIsInitialized } from '../../../../../src/pushNotifications/errors/errorHelpers';

jest.mock('@aws-amplify/react-native', () => ({
	loadAmplifyPushNotification: jest.fn(() => ({
		getBadgeCount: mockGetBadgeCountNative,
	})),
}));
jest.mock('../../../../../src/pushNotifications/errors/errorHelpers');

// module level mocks
const mockGetBadgeCountNative = jest.fn();

describe('getBadgeCount (native)', () => {
	let getBadgeCount;
	// assert mocks
	const mockAssertIsInitialized = assertIsInitialized as jest.Mock;

	beforeAll(() => {
		({
			getBadgeCount,
		} = require('../../../../../src/pushNotifications/providers/pinpoint/apis/getBadgeCount.native'));
	});

	afterEach(() => {
		mockAssertIsInitialized.mockReset();
		mockGetBadgeCountNative.mockReset();
	});

	it('must be initialized', async () => {
		mockAssertIsInitialized.mockImplementation(() => {
			throw new Error();
		});
		await expect(getBadgeCount()).rejects.toThrow();
	});

	it('returns the result of the native call', async () => {
		mockGetBadgeCountNative.mockResolvedValue(42);
		expect(await getBadgeCount()).toBe(42);
	});
});
