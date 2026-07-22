// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PushNotificationAction } from '@aws-amplify/core/internals/utils';

import {
	DeviceRegistration,
	identifyUserInternal,
	registerDeviceInternal,
	removeDeviceInternal,
} from '../../../../../src/pushNotifications/providers/customer-profiles/utils/identifyUserInternal';
import { signedFetch } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/signedFetch';
import {
	IDENTIFY_USER_PATH,
	REGISTER_DEVICE_PATH,
	REMOVE_DEVICE_PATH,
} from '../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveConfig';
import { channelType } from '../../../../testUtils/data';

jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils/signedFetch',
);

describe('customer-profiles transport callers', () => {
	const mockSignedFetch = signedFetch as jest.Mock;

	beforeEach(() => {
		mockSignedFetch.mockResolvedValue(undefined);
	});

	afterEach(() => {
		mockSignedFetch.mockReset();
	});

	describe('identifyUserInternal', () => {
		it('POSTs the userProfile to the identify-user route (no userId)', async () => {
			const userProfile = { email: 'user@example.com', name: 'Jane' };
			await identifyUserInternal({ userProfile });

			expect(mockSignedFetch).toHaveBeenCalledTimes(1);
			expect(mockSignedFetch).toHaveBeenCalledWith(
				IDENTIFY_USER_PATH,
				{ userProfile },
				PushNotificationAction.IdentifyUser,
			);
			const [, body] = mockSignedFetch.mock.calls[0];
			expect(body).not.toHaveProperty('userId');
		});

		it('defaults userProfile to an empty object when omitted', async () => {
			await identifyUserInternal({});
			expect(mockSignedFetch).toHaveBeenCalledWith(
				IDENTIFY_USER_PATH,
				{ userProfile: {} },
				PushNotificationAction.IdentifyUser,
			);
		});
	});

	describe('registerDeviceInternal', () => {
		it('POSTs the device object (nested under device) to the register-device route', async () => {
			const device: DeviceRegistration = {
				token: 'device-token',
				deviceId: 'device-id',
				platform: 'ios',
				appVersion: '',
				channelType,
			};
			await registerDeviceInternal(device);

			expect(mockSignedFetch).toHaveBeenCalledTimes(1);
			expect(mockSignedFetch).toHaveBeenCalledWith(
				REGISTER_DEVICE_PATH,
				{ device },
				PushNotificationAction.RegisterDevice,
			);
		});
	});

	describe('removeDeviceInternal', () => {
		it('POSTs the deviceId to the remove-device route', async () => {
			await removeDeviceInternal('device-id');

			expect(mockSignedFetch).toHaveBeenCalledTimes(1);
			expect(mockSignedFetch).toHaveBeenCalledWith(
				REMOVE_DEVICE_PATH,
				{ deviceId: 'device-id' },
				PushNotificationAction.RemoveDevice,
			);
		});
	});
});
