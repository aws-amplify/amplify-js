// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { assertIsInitialized } from '../../../../../src/pushNotifications/errors/errorHelpers';
import { identifyUser } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/identifyUser.native';
import { IdentifyUserInput } from '../../../../../src/pushNotifications/providers/customer-profiles/types';
import { getToken } from '../../../../../src/pushNotifications/utils';
import {
	getChannelType,
	getDeviceId,
	getInflightDeviceRegistration,
	identifyUserInternal,
} from '../../../../../src/pushNotifications/providers/customer-profiles/utils';
import { accessToken, channelType } from '../../../../testUtils/data';

jest.mock('@aws-amplify/react-native', () => ({
	getOperatingSystem: jest.fn(),
}));
jest.mock('../../../../../src/pushNotifications/errors/errorHelpers');
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils',
);
jest.mock('../../../../../src/pushNotifications/utils');

const DEVICE_ID = 'persisted-device-id';

describe('identifyUser (customer-profiles, native)', () => {
	const mockAssertIsInitialized = assertIsInitialized as jest.Mock;
	const mockGetChannelType = getChannelType as jest.Mock;
	const mockGetToken = getToken as jest.Mock;
	const mockGetDeviceId = getDeviceId as jest.Mock;
	const mockGetInflightDeviceRegistration =
		getInflightDeviceRegistration as jest.Mock;
	const mockIdentifyUserInternal = identifyUserInternal as jest.Mock;

	beforeAll(() => {
		mockGetChannelType.mockReturnValue(channelType);
		mockGetToken.mockReturnValue(accessToken);
		mockGetDeviceId.mockResolvedValue(DEVICE_ID);
	});

	afterEach(() => {
		mockAssertIsInitialized.mockReset();
		mockGetInflightDeviceRegistration.mockReset();
		mockIdentifyUserInternal.mockReset();
		mockGetDeviceId.mockClear();
	});

	it('must be initialized', async () => {
		mockAssertIsInitialized.mockImplementation(() => {
			throw new Error();
		});
		await expect(
			identifyUser({ userId: 'user-id', userProfile: {} }),
		).rejects.toThrow();
		expect(mockIdentifyUserInternal).not.toHaveBeenCalled();
	});

	it('registers the device (using the current token) and user profile with Customer Profiles', async () => {
		mockGetInflightDeviceRegistration.mockReturnValue(undefined);
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {
				customProperties: { hobbies: ['biking', 'climbing'] },
				email: 'email',
				name: 'name',
				plan: 'plan',
			},
		};
		await identifyUser(input);
		expect(mockIdentifyUserInternal).toHaveBeenCalledWith({
			deviceToken: accessToken,
			channelType,
			userId: input.userId,
			userProfile: input.userProfile,
			options: { deviceId: DEVICE_ID },
		});
	});

	it('prefers an explicit options.address over the current token', async () => {
		mockGetInflightDeviceRegistration.mockReturnValue(undefined);
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
			options: { address: 'explicit-address' },
		};
		await identifyUser(input);
		expect(mockIdentifyUserInternal).toHaveBeenCalledWith({
			deviceToken: 'explicit-address',
			channelType,
			userId: input.userId,
			userProfile: input.userProfile,
			options: { address: 'explicit-address', deviceId: DEVICE_ID },
		});
	});

	it('passes through service options', async () => {
		mockGetInflightDeviceRegistration.mockReturnValue(undefined);
		const userAttributes = { hobbies: ['biking', 'climbing'] };
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
			options: { userAttributes },
		};
		await identifyUser(input);
		expect(mockIdentifyUserInternal).toHaveBeenCalledWith(
			expect.objectContaining({
				options: { userAttributes, deviceId: DEVICE_ID },
			}),
		);
	});

	it('resolves the stable per-install deviceId in the native layer and injects it into options', async () => {
		mockGetInflightDeviceRegistration.mockReturnValue(undefined);
		await identifyUser({ userId: 'user-id', userProfile: {} });
		expect(mockGetDeviceId).toHaveBeenCalledTimes(1);
		expect(mockIdentifyUserInternal).toHaveBeenCalledWith(
			expect.objectContaining({ options: { deviceId: DEVICE_ID } }),
		);
	});

	it('prefers a caller-supplied options.deviceId without resolving a new one', async () => {
		mockGetInflightDeviceRegistration.mockReturnValue(undefined);
		await identifyUser({
			userId: 'user-id',
			userProfile: {},
			options: { deviceId: 'caller-device-id' },
		});
		expect(mockGetDeviceId).not.toHaveBeenCalled();
		expect(mockIdentifyUserInternal).toHaveBeenCalledWith(
			expect.objectContaining({ options: { deviceId: 'caller-device-id' } }),
		);
	});

	it('passes through guest-merge and device-registration options', async () => {
		mockGetInflightDeviceRegistration.mockReturnValue(undefined);
		const options = {
			previousGuestIdentityId: 'us-east-1:guest',
			deviceId: 'device-id',
			platform: 'ios',
			appVersion: '1.2.3',
		};
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
			options,
		};
		await identifyUser(input);
		expect(mockIdentifyUserInternal).toHaveBeenCalledWith(
			expect.objectContaining({ options }),
		);
	});

	it('awaits the inflight device registration before associating the user', async () => {
		let resolveRegistration!: () => void;
		const inflight = new Promise<void>(resolve => {
			resolveRegistration = resolve;
		});
		mockGetInflightDeviceRegistration.mockReturnValue(inflight);

		const identifyPromise = identifyUser({
			userId: 'user-id',
			userProfile: {},
		});
		// registration has not completed yet, so the user association must not have run
		await Promise.resolve();
		expect(mockIdentifyUserInternal).not.toHaveBeenCalled();

		resolveRegistration();
		await identifyPromise;
		expect(mockGetInflightDeviceRegistration).toHaveBeenCalled();
		expect(mockIdentifyUserInternal).toHaveBeenCalled();
	});

	it('does not block when there is no inflight device registration', async () => {
		mockGetInflightDeviceRegistration.mockReturnValue(undefined);
		await identifyUser({ userId: 'user-id', userProfile: {} });
		expect(mockIdentifyUserInternal).toHaveBeenCalled();
	});

	it('rejects if the inflight device registration rejects', async () => {
		mockGetInflightDeviceRegistration.mockReturnValue(
			Promise.reject(new Error('registration failed')),
		);
		await expect(
			identifyUser({ userId: 'user-id', userProfile: {} }),
		).rejects.toThrow();
		expect(mockIdentifyUserInternal).not.toHaveBeenCalled();
	});

	it('rejects if the device registration POST rejects', async () => {
		mockGetInflightDeviceRegistration.mockReturnValue(undefined);
		mockIdentifyUserInternal.mockRejectedValue(new Error());
		await expect(
			identifyUser({ userId: 'user-id', userProfile: {} }),
		).rejects.toThrow();
	});
});
