// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertIsInitialized } from '../../../../../src/pushNotifications/errors/errorHelpers';

jest.mock('@aws-amplify/react-native', () => ({
	loadAmplifyPushNotification: jest.fn(() => ({
		setBadgeCount: mockSetBadgeCountNative,
	})),
}));
jest.mock('../../../../../src/pushNotifications/errors/errorHelpers');

// module level mocks
const mockSetBadgeCountNative = jest.fn();

describe('setBadgeCount (native)', () => {
	let setBadgeCount;
	// assert mocks
	const mockAssertIsInitialized = assertIsInitialized as jest.Mock;

	beforeAll(() => {
		({
			setBadgeCount,
		} = require('../../../../../src/pushNotifications/providers/pinpoint/apis/setBadgeCount.native'));
	});

	afterEach(() => {
		mockAssertIsInitialized.mockReset();
		mockSetBadgeCountNative.mockReset();
	});

	it('must be initialized', () => {
		mockAssertIsInitialized.mockImplementation(() => {
			throw new Error();
		});
		expect(() => setBadgeCount(42)).toThrow();
	});

	it('returns the result of the native call', async () => {
		setBadgeCount(42);
		expect(mockSetBadgeCountNative).toBeCalledWith(42);
	});
});
