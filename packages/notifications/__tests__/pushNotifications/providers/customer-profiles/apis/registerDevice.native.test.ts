// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getClientInfo } from '@aws-amplify/core/internals/utils';

import { assertIsInitialized } from '../../../../../src/pushNotifications/errors/errorHelpers';
import {
	buildDeviceRegistration,
	registerDevice,
} from '../../../../../src/pushNotifications/providers/customer-profiles/apis/registerDevice.native';
import { PushNotificationError } from '../../../../../src/pushNotifications/errors';
import { getToken } from '../../../../../src/pushNotifications/utils';
import {
	getChannelType,
	getDeviceId,
	registerDeviceInternal,
} from '../../../../../src/pushNotifications/providers/customer-profiles/utils';
import { channelType, pushToken } from '../../../../testUtils/data';

jest.mock('@aws-amplify/core/internals/utils');
jest.mock('@aws-amplify/react-native', () => ({
	getOperatingSystem: jest.fn(),
	loadAsyncStorage: jest.fn(),
}));
jest.mock('../../../../../src/pushNotifications/errors/errorHelpers', () => ({
	...jest.requireActual(
		'../../../../../src/pushNotifications/errors/errorHelpers',
	),
	assertIsInitialized: jest.fn(),
}));
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils',
);
jest.mock('../../../../../src/pushNotifications/utils');

const DEVICE_ID = 'persisted-device-id';

describe('registerDevice (customer-profiles, native)', () => {
	const mockAssertIsInitialized = assertIsInitialized as jest.Mock;
	const mockGetClientInfo = getClientInfo as jest.Mock;
	const mockGetChannelType = getChannelType as jest.Mock;
	const mockGetDeviceId = getDeviceId as jest.Mock;
	const mockGetToken = getToken as jest.Mock;
	const mockRegisterDeviceInternal = registerDeviceInternal as jest.Mock;

	beforeEach(() => {
		mockGetClientInfo.mockReturnValue({ platform: 'ios' });
		mockGetChannelType.mockReturnValue(channelType);
		mockGetDeviceId.mockResolvedValue(DEVICE_ID);
		mockGetToken.mockReturnValue(pushToken);
		mockRegisterDeviceInternal.mockResolvedValue(undefined);
	});

	afterEach(() => {
		mockAssertIsInitialized.mockReset();
		mockGetClientInfo.mockReset();
		mockGetChannelType.mockReset();
		mockGetDeviceId.mockReset();
		mockGetToken.mockReset();
		mockRegisterDeviceInternal.mockReset();
	});

	it('must be initialized', async () => {
		mockAssertIsInitialized.mockImplementation(() => {
			throw new Error();
		});
		await expect(registerDevice({ token: pushToken })).rejects.toThrow();
		expect(mockRegisterDeviceInternal).not.toHaveBeenCalled();
	});

	it('registers the device with the internally-managed device fields', async () => {
		await registerDevice({ token: pushToken });

		expect(mockGetDeviceId).toHaveBeenCalledTimes(1);
		expect(mockRegisterDeviceInternal).toHaveBeenCalledTimes(1);
		expect(mockRegisterDeviceInternal).toHaveBeenCalledWith({
			token: pushToken,
			deviceId: DEVICE_ID,
			platform: 'ios',
			appVersion: '',
			channelType,
		});
	});

	it('falls back to the current token when none is supplied (auto-registration path)', async () => {
		const built = await buildDeviceRegistration();
		expect(mockGetToken).toHaveBeenCalled();
		expect(built).toEqual(
			expect.objectContaining({ token: pushToken, deviceId: DEVICE_ID }),
		);
	});

	it('throws NoToken when neither a supplied nor a current token is available', async () => {
		mockGetToken.mockReturnValue(undefined);
		await expect(buildDeviceRegistration()).rejects.toBeInstanceOf(
			PushNotificationError,
		);
	});

	it('rejects if the register-device request rejects', async () => {
		mockRegisterDeviceInternal.mockRejectedValue(new Error('service error'));
		await expect(registerDevice({ token: pushToken })).rejects.toThrow(
			'service error',
		);
	});
});
