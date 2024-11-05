// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertIsInitialized } from '../../../../../src/pushNotifications/errors/errorHelpers';

jest.mock('@aws-amplify/react-native', () => ({
	loadAmplifyPushNotification: jest.fn(() => ({
		requestPermissions: mockRequestPermissionsNative,
	})),
}));
jest.mock('../../../../../src/pushNotifications/errors/errorHelpers');

// module level mocks
const mockRequestPermissionsNative = jest.fn();

describe('requestPermissions (native)', () => {
	let requestPermissions;
	// assert mocks
	const mockAssertIsInitialized = assertIsInitialized as jest.Mock;

	beforeAll(() => {
		({
			requestPermissions,
		} = require('../../../../../src/pushNotifications/providers/pinpoint/apis/requestPermissions.native'));
	});

	afterEach(() => {
		mockAssertIsInitialized.mockReset();
		mockRequestPermissionsNative.mockReset();
	});

	it('must be initialized', async () => {
		mockAssertIsInitialized.mockImplementation(() => {
			throw new Error();
		});
		await expect(requestPermissions()).rejects.toThrow();
	});

	it('returns the result of the native call', async () => {
		mockRequestPermissionsNative.mockResolvedValue(true);
		expect(await requestPermissions()).toBe(true);
	});
});
