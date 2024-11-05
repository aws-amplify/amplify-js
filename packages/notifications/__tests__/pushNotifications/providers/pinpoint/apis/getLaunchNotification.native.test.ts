// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertIsInitialized } from '../../../../../src/pushNotifications/errors/errorHelpers';
import { simplePushMessage } from '../../../../testUtils/data';

jest.mock('@aws-amplify/react-native', () => ({
	loadAmplifyPushNotification: jest.fn(() => ({
		getLaunchNotification: mockGetLaunchNotificationNative,
	})),
}));
jest.mock('../../../../../src/pushNotifications/errors/errorHelpers');

// module level mocks
const mockGetLaunchNotificationNative = jest.fn();

describe('getLaunchNotification (native)', () => {
	let getLaunchNotification;
	// assert mocks
	const mockAssertIsInitialized = assertIsInitialized as jest.Mock;

	beforeAll(() => {
		({
			getLaunchNotification,
		} = require('../../../../../src/pushNotifications/providers/pinpoint/apis/getLaunchNotification.native'));
	});

	afterEach(() => {
		mockAssertIsInitialized.mockReset();
		mockGetLaunchNotificationNative.mockReset();
	});

	it('must be initialized', async () => {
		mockAssertIsInitialized.mockImplementation(() => {
			throw new Error();
		});
		await expect(getLaunchNotification()).rejects.toThrow();
	});

	it('returns the result of the native call', async () => {
		mockGetLaunchNotificationNative.mockResolvedValue(simplePushMessage);
		expect(await getLaunchNotification()).toBe(simplePushMessage);
	});
});
