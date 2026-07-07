// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signRequest } from '@aws-amplify/core/internals/aws-client-utils';

import { AnalyticsError } from '../../../../src/errors';
import { identifyUser } from '../../../../src/providers/customer-profiles/apis';
import { IdentifyUserInput } from '../../../../src/providers/customer-profiles/types';
import {
	resolveConfig,
	resolveCredentials,
} from '../../../../src/providers/customer-profiles/utils';

jest.mock('../../../../src/providers/customer-profiles/utils');
jest.mock('@aws-amplify/core/internals/aws-client-utils');

describe('Analytics Customer Profiles Provider API: identifyUser', () => {
	const endpoint = 'https://example.com/prod';
	const token = 'user-pool-access-token';
	const config = { endpoint, region: 'region' };

	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockSignRequest = signRequest as jest.Mock;
	const mockFetch = jest.fn();

	beforeAll(() => {
		(global as any).fetch = mockFetch;
	});

	beforeEach(() => {
		mockResolveConfig.mockReturnValue(config);
		mockResolveCredentials.mockResolvedValue({ token });
		mockFetch.mockResolvedValue({ ok: true, status: 200 });
	});

	afterEach(() => {
		mockResolveConfig.mockReset();
		mockResolveCredentials.mockReset();
		mockSignRequest.mockReset();
		mockFetch.mockReset();
	});

	it('POSTs to the identify-user endpoint with the Bearer token attached', async () => {
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
		};

		await identifyUser(input);

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const [url, request] = mockFetch.mock.calls[0];
		expect(url).toBe(`${endpoint}/identify-user`);
		expect(request.method).toBe('POST');
		expect(request.headers).toMatchObject({
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		});
	});

	it('sends the frozen request body shape', async () => {
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {
				email: 'email@example.com',
				customProperties: {
					phoneNumber: ['555-555-5555'],
				},
			},
			options: {
				userAttributes: { hobbies: ['biking', 'climbing'] },
				address: 'device-token',
				channelType: 'APNS',
				optOut: 'NONE',
			},
		};

		await identifyUser(input);

		const [, request] = mockFetch.mock.calls[0];
		expect(JSON.parse(request.body)).toEqual({
			userId: input.userId,
			userProfile: input.userProfile,
			options: input.options,
		});
	});

	it('forwards options.previousGuestIdentityId on an authenticated call (merge-on-sign-in)', async () => {
		const input: IdentifyUserInput = {
			userId: 'user-id',
			userProfile: {},
			options: {
				previousGuestIdentityId: 'us-east-1:prior-guest-identity-id',
			},
		};

		await identifyUser(input);

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const [url, request] = mockFetch.mock.calls[0];
		expect(url).toBe(`${endpoint}/identify-user`);
		expect(request.headers.Authorization).toBe(`Bearer ${token}`);
		expect(JSON.parse(request.body).options.previousGuestIdentityId).toBe(
			'us-east-1:prior-guest-identity-id',
		);
		// The merge hint travels on the authenticated route; the guest SigV4 path
		// is not taken when a user-pool token is present.
		expect(mockSignRequest).not.toHaveBeenCalled();
	});

	it('omits undefined userId and options from the request body', async () => {
		const input: IdentifyUserInput = {
			userId: undefined as unknown as string,
			userProfile: { email: 'email@example.com' },
		};

		await identifyUser(input);

		const [, request] = mockFetch.mock.calls[0];
		expect(JSON.parse(request.body)).toEqual({
			userProfile: { email: 'email@example.com' },
		});
	});

	it('resolves to void on a 2xx response', async () => {
		mockFetch.mockResolvedValue({ ok: true, status: 200 });

		await expect(
			identifyUser({ userId: 'user-id', userProfile: {} }),
		).resolves.toBeUndefined();
	});

	it('throws a typed AnalyticsError on a non-2xx response', async () => {
		mockFetch.mockResolvedValue({ ok: false, status: 500 });

		await expect(
			identifyUser({ userId: 'user-id', userProfile: {} }),
		).rejects.toBeInstanceOf(AnalyticsError);
	});

	it('throws a typed AnalyticsError when the network request fails', async () => {
		mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

		await expect(
			identifyUser({ userId: 'user-id', userProfile: {} }),
		).rejects.toBeInstanceOf(AnalyticsError);
	});

	it('rejects if config resolution fails', async () => {
		mockResolveConfig.mockImplementation(() => {
			throw new Error('no config');
		});

		await expect(
			identifyUser({ userId: 'user-id', userProfile: {} }),
		).rejects.toBeDefined();
		expect(mockFetch).not.toHaveBeenCalled();
	});

	describe('guest (Identity Pool) path', () => {
		const credentials = {
			accessKeyId: 'access-key-id',
			secretAccessKey: 'secret-access-key',
			sessionToken: 'session-token',
		};

		beforeEach(() => {
			// No user-pool token -> guest credentials only.
			mockResolveCredentials.mockResolvedValue({
				token: undefined,
				credentials,
				identityId: 'us-east-1:guest',
			});
			mockSignRequest.mockReturnValue({
				headers: {
					authorization: 'AWS4-HMAC-SHA256 Credential=...',
					'x-amz-date': '20260704T000000Z',
					'x-amz-security-token': credentials.sessionToken,
					host: 'example.com',
					'content-type': 'application/json',
				},
			});
		});

		it('SigV4-signs a POST to the guest route with the guest credentials', async () => {
			await identifyUser({ userId: 'guest-user', userProfile: {} });

			// The signer was invoked for execute-api with the guest credentials.
			expect(mockSignRequest).toHaveBeenCalledTimes(1);
			const [request, signOptions] = mockSignRequest.mock.calls[0];
			expect(request.method).toBe('POST');
			expect(request.url.toString()).toBe(`${endpoint}/identify-user-guest`);
			expect(signOptions).toMatchObject({
				credentials,
				signingRegion: config.region,
				signingService: 'execute-api',
			});

			// The request went to the guest route with the signed headers.
			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [url, req] = mockFetch.mock.calls[0];
			expect(url).toBe(`${endpoint}/identify-user-guest`);
			expect(req.method).toBe('POST');
			expect(req.headers.authorization).toContain('AWS4-HMAC-SHA256');
			expect(req.headers).not.toHaveProperty('Authorization');
		});

		it('throws a typed AnalyticsError on a non-2xx guest response', async () => {
			mockFetch.mockResolvedValue({ ok: false, status: 403 });

			await expect(
				identifyUser({ userId: 'guest-user', userProfile: {} }),
			).rejects.toBeInstanceOf(AnalyticsError);
		});
	});
});
