// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsError } from '../../../../src/errors';
import { identifyUser } from '../../../../src/providers/customer-profiles/apis';
import { IdentifyUserInput } from '../../../../src/providers/customer-profiles/types';
import {
	resolveConfig,
	resolveCredentials,
} from '../../../../src/providers/customer-profiles/utils';

jest.mock('../../../../src/providers/customer-profiles/utils');

describe('Analytics Customer Profiles Provider API: identifyUser', () => {
	const endpoint = 'https://example.com/prod';
	const token = 'user-pool-access-token';
	const config = { endpoint, region: 'region' };

	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
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
});
