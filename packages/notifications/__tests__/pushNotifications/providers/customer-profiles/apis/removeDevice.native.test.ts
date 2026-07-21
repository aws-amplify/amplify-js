// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertIsInitialized } from '../../../../../src/pushNotifications/errors/errorHelpers';
import { removeDevice } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/removeDevice.native';
import {
	getDeviceId,
	removeDeviceInternal,
} from '../../../../../src/pushNotifications/providers/customer-profiles/utils';

jest.mock('@aws-amplify/react-native', () => ({
	getOperatingSystem: jest.fn(),
	loadAsyncStorage: jest.fn(),
}));
jest.mock('../../../../../src/pushNotifications/errors/errorHelpers');
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils',
);

const DEVICE_ID = 'persisted-device-id';

describe('removeDevice (customer-profiles, native)', () => {
	const mockAssertIsInitialized = assertIsInitialized as jest.Mock;
	const mockGetDeviceId = getDeviceId as jest.Mock;
	const mockRemoveDeviceInternal = removeDeviceInternal as jest.Mock;

	beforeEach(() => {
		mockGetDeviceId.mockResolvedValue(DEVICE_ID);
		mockRemoveDeviceInternal.mockResolvedValue(undefined);
	});

	afterEach(() => {
		mockAssertIsInitialized.mockReset();
		mockGetDeviceId.mockReset();
		mockRemoveDeviceInternal.mockReset();
	});

	it('must be initialized', async () => {
		mockAssertIsInitialized.mockImplementation(() => {
			throw new Error();
		});
		await expect(removeDevice()).rejects.toThrow();
		expect(mockRemoveDeviceInternal).not.toHaveBeenCalled();
	});

	it('removes the device using the stable per-install deviceId', async () => {
		await removeDevice();

		expect(mockGetDeviceId).toHaveBeenCalledTimes(1);
		expect(mockRemoveDeviceInternal).toHaveBeenCalledTimes(1);
		expect(mockRemoveDeviceInternal).toHaveBeenCalledWith(DEVICE_ID);
	});

	it('rejects if the remove-device request rejects', async () => {
		mockRemoveDeviceInternal.mockRejectedValue(new Error('service error'));
		await expect(removeDevice()).rejects.toThrow('service error');
	});
});
