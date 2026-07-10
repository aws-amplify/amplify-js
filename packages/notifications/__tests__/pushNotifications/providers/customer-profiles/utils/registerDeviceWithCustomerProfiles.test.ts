// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { signRequest } from '@aws-amplify/core/internals/aws-client-utils';

import { registerDeviceWithCustomerProfiles } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/registerDeviceWithCustomerProfiles';
import { getDeviceId } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/getDeviceId';
import {
	accessToken,
	channelType,
	customerProfilesConfig,
	userId,
} from '../../../../testUtils/data';

jest.mock('@aws-amplify/react-native', () => ({
	getOperatingSystem: jest.fn(),
	loadAsyncStorage: jest.fn(),
}));
jest.mock('@aws-amplify/core', () => {
	const actual = jest.requireActual('@aws-amplify/core');

	return {
		...actual,
		fetchAuthSession: jest.fn(),
	};
});
jest.mock('@aws-amplify/core/internals/aws-client-utils');
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils/getDeviceId',
);

const DEVICE_ID = 'persisted-device-id';

describe('registerDeviceWithCustomerProfiles', () => {
	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockSignRequest = signRequest as jest.Mock;
	const mockGetDeviceId = getDeviceId as jest.Mock;
	const mockFetch = jest.fn();

	beforeAll(() => {
		(global as any).fetch = mockFetch;
	});

	beforeEach(() => {
		getConfigSpy.mockReturnValue({
			Notifications: {
				PushNotification: { CustomerProfiles: customerProfilesConfig },
			},
		});
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: { toString: () => accessToken } },
		});
		mockGetDeviceId.mockResolvedValue(DEVICE_ID);
		mockFetch.mockResolvedValue({ ok: true, status: 200 });
	});

	afterEach(() => {
		getConfigSpy.mockReset();
		mockFetchAuthSession.mockReset();
		mockSignRequest.mockReset();
		mockGetDeviceId.mockReset();
		mockFetch.mockReset();
	});

	it('POSTs the device registration to the Customer Profiles identify-user endpoint with a Bearer token', async () => {
		await registerDeviceWithCustomerProfiles({
			deviceToken: 'device-token',
			channelType,
		});

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const [url, request] = mockFetch.mock.calls[0];
		expect(url).toBe(`${customerProfilesConfig.endpoint}/identify-user`);
		expect(request.method).toBe('POST');
		expect(request.headers).toStrictEqual({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		});
		// Device-registration fields are nested under `options` per the backend
		// `IdentifyUserRequest` contract, with a resolved stable `deviceId`.
		// `userId` is omitted from the serialized body when not provided.
		expect(JSON.parse(request.body)).toStrictEqual({
			userProfile: {},
			options: {
				deviceId: DEVICE_ID,
				address: 'device-token',
				channelType,
			},
		});
	});

	it('resolves a stable per-install deviceId when the caller does not supply one', async () => {
		await registerDeviceWithCustomerProfiles({
			deviceToken: 'device-token',
			channelType,
		});

		expect(mockGetDeviceId).toHaveBeenCalledTimes(1);
		expect(JSON.parse(mockFetch.mock.calls[0][1].body).options.deviceId).toBe(
			DEVICE_ID,
		);
	});

	it('uses a caller-supplied deviceId without resolving a new one', async () => {
		await registerDeviceWithCustomerProfiles({
			deviceToken: 'device-token',
			channelType,
			options: { deviceId: 'caller-device-id' },
		});

		expect(mockGetDeviceId).not.toHaveBeenCalled();
		expect(JSON.parse(mockFetch.mock.calls[0][1].body).options.deviceId).toBe(
			'caller-device-id',
		);
	});

	it('includes user identity information when identifying a user', async () => {
		const userProfile = { email: 'user@example.com' };
		const options = { userAttributes: { hobbies: ['climbing'] } };
		await registerDeviceWithCustomerProfiles({
			deviceToken: 'device-token',
			channelType,
			userId,
			userProfile,
			options,
		});

		expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toStrictEqual({
			userId,
			userProfile,
			options: {
				userAttributes: { hobbies: ['climbing'] },
				deviceId: DEVICE_ID,
				address: 'device-token',
				channelType,
			},
		});
	});

	it('does not call the Pinpoint UpdateEndpoint client (network POST only)', async () => {
		await registerDeviceWithCustomerProfiles({
			deviceToken: 'device-token',
			channelType,
		});
		// The only outbound call is the REST POST performed via fetch.
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it('resolves when the endpoint responds with a 2xx status', async () => {
		mockFetch.mockResolvedValue({ ok: true, status: 204 });
		await expect(
			registerDeviceWithCustomerProfiles({
				deviceToken: 'device-token',
				channelType,
			}),
		).resolves.toBeUndefined();
	});

	it('throws when the endpoint responds with a non-2xx status', async () => {
		mockFetch.mockResolvedValue({ ok: false, status: 500 });
		await expect(
			registerDeviceWithCustomerProfiles({
				deviceToken: 'device-token',
				channelType,
			}),
		).rejects.toThrow();
	});

	it('throws when the network request fails', async () => {
		mockFetch.mockRejectedValue(new Error('network down'));
		await expect(
			registerDeviceWithCustomerProfiles({
				deviceToken: 'device-token',
				channelType,
			}),
		).rejects.toThrow();
	});

	it('throws when neither a token nor guest credentials are available', async () => {
		mockFetchAuthSession.mockResolvedValue({
			tokens: undefined,
			credentials: undefined,
		});
		await expect(
			registerDeviceWithCustomerProfiles({
				deviceToken: 'device-token',
				channelType,
			}),
		).rejects.toThrow();
		expect(mockFetch).not.toHaveBeenCalled();
	});

	describe('guest (Identity Pool) path', () => {
		const guestCredentials = {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
			sessionToken: 'session-token',
		};

		beforeEach(() => {
			// No user-pool token -> guest Identity Pool credentials only.
			mockFetchAuthSession.mockResolvedValue({
				tokens: undefined,
				credentials: guestCredentials,
				identityId: 'us-east-1:guest',
			});
			mockSignRequest.mockReturnValue({
				headers: {
					authorization: 'AWS4-HMAC-SHA256 Credential=...',
					'x-amz-date': '20260704T000000Z',
					'x-amz-security-token': guestCredentials.sessionToken,
					host: 'customer-profiles.example.com',
					'content-type': 'application/json',
				},
			});
		});

		it('SigV4-signs a POST to the guest route with the guest credentials', async () => {
			await registerDeviceWithCustomerProfiles({
				deviceToken: 'device-token',
				channelType,
			});

			// The signer was invoked for execute-api with the guest credentials.
			expect(mockSignRequest).toHaveBeenCalledTimes(1);
			const [request, signOptions] = mockSignRequest.mock.calls[0];
			expect(request.method).toBe('POST');
			expect(request.url.toString()).toBe(
				`${customerProfilesConfig.endpoint}/identify-user-guest`,
			);
			expect(signOptions).toMatchObject({
				credentials: guestCredentials,
				signingRegion: customerProfilesConfig.region,
				signingService: 'execute-api',
			});

			// The request went to the guest route with the signed headers, and
			// no Bearer Authorization header was set.
			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [url, req] = mockFetch.mock.calls[0];
			expect(url).toBe(
				`${customerProfilesConfig.endpoint}/identify-user-guest`,
			);
			expect(req.method).toBe('POST');
			expect(req.headers.authorization).toContain('AWS4-HMAC-SHA256');
			expect(req.headers).not.toHaveProperty('Authorization');
		});

		it('sends the device registration in the guest request body', async () => {
			await registerDeviceWithCustomerProfiles({
				deviceToken: 'device-token',
				channelType,
			});
			expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toStrictEqual({
				userProfile: {},
				options: {
					deviceId: DEVICE_ID,
					address: 'device-token',
					channelType,
				},
			});
		});

		it('throws when the guest endpoint responds with a non-2xx status', async () => {
			mockFetch.mockResolvedValue({ ok: false, status: 403 });
			await expect(
				registerDeviceWithCustomerProfiles({
					deviceToken: 'device-token',
					channelType,
				}),
			).rejects.toThrow();
		});
	});
});
