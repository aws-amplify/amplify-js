// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertIsInitialized } from '../../../../../src/pushNotifications/errors/errorHelpers';

jest.mock('@aws-amplify/react-native', () => ({
	loadAmplifyPushNotification: jest.fn(() => ({
		getPermissionStatus: mockGetPermissionStatusNative,
	})),
}));
jest.mock('../../../../../src/pushNotifications/errors/errorHelpers');

// module level mocks
const mockGetPermissionStatusNative = jest.fn();

describe('getPermissionStatus (native)', () => {
	let getPermissionStatus;
	// assert mocks
	const mockAssertIsInitialized = assertIsInitialized as jest.Mock;

	beforeAll(() => {
		({
			getPermissionStatus,
		} = require('../../../../../src/pushNotifications/providers/pinpoint/apis/getPermissionStatus.native'));
	});

	afterEach(() => {
		mockAssertIsInitialized.mockReset();
		mockGetPermissionStatusNative.mockReset();
	});

	it('must be initialized', async () => {
		mockAssertIsInitialized.mockImplementation(() => {
			throw new Error();
		});
		await expect(getPermissionStatus()).rejects.toThrow();
	});

	it('returns the result of the native call', async () => {
		const status = 'granted';
		mockGetPermissionStatusNative.mockResolvedValue(status);
		expect(await getPermissionStatus()).toBe(status);
	});
});
