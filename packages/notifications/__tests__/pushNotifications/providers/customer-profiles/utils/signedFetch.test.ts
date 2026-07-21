// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signRequest } from '@aws-amplify/core/internals/aws-client-utils';

import { PushNotificationError } from '../../../../../src/pushNotifications/errors';
import { signedFetch } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/signedFetch';
import { resolveConfig } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveConfig';
import { resolveCredentials } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveCredentials';
import { customerProfilesConfig } from '../../../../testUtils/data';

jest.mock('@aws-amplify/core/internals/aws-client-utils');
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveConfig',
);
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveCredentials',
);

describe('signedFetch (customer-profiles transport)', () => {
	const credentials = {
		accessKeyId: 'access-key-id',
		secretAccessKey: 'secret-access-key',
		sessionToken: 'session-token',
	};
	const signedHeaders = {
		authorization: 'AWS4-HMAC-SHA256 Credential=...',
		'x-amz-date': '20260721T000000Z',
		'x-amz-security-token': credentials.sessionToken,
		host: 'customer-profiles.example.com',
		'content-type': 'application/json',
	};
	const mockSignRequest = signRequest as jest.Mock;
	const mockResolveConfig = resolveConfig as jest.Mock;
	const mockResolveCredentials = resolveCredentials as jest.Mock;
	const mockFetch = jest.fn();

	beforeAll(() => {
		(global as any).fetch = mockFetch;
	});

	beforeEach(() => {
		mockResolveConfig.mockReturnValue(customerProfilesConfig);
		mockResolveCredentials.mockResolvedValue({ credentials });
		mockSignRequest.mockReturnValue({ headers: signedHeaders });
		mockFetch.mockResolvedValue({ ok: true, status: 200 });
	});

	afterEach(() => {
		mockSignRequest.mockReset();
		mockResolveConfig.mockReset();
		mockResolveCredentials.mockReset();
		mockFetch.mockReset();
	});

	it('SigV4-signs an execute-api POST and sends the signed request', async () => {
		const body = { userProfile: { email: 'a@b.com' } };
		await signedFetch('/identify-user', body);

		expect(mockSignRequest).toHaveBeenCalledTimes(1);
		const [request, signOptions] = mockSignRequest.mock.calls[0];
		expect(request.method).toBe('POST');
		expect(request.url.toString()).toBe(
			`${customerProfilesConfig.endpoint}/identify-user`,
		);
		expect(request.body).toBe(JSON.stringify(body));
		expect(signOptions).toMatchObject({
			credentials,
			signingRegion: customerProfilesConfig.region,
			signingService: 'execute-api',
		});

		// The Amplify telemetry user-agent is attached BEFORE signing so the
		// signature covers it (well-formed: contains the aws-amplify version and
		// the push-notification category tag).
		expect(request.headers['x-amz-user-agent']).toBeDefined();
		expect(request.headers['x-amz-user-agent']).toContain('aws-amplify/');
		expect(request.headers['x-amz-user-agent']).toContain('pushnotification');

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const [url, req] = mockFetch.mock.calls[0];
		expect(url).toBe(`${customerProfilesConfig.endpoint}/identify-user`);
		expect(req.method).toBe('POST');
		expect(req.headers.authorization).toContain('AWS4-HMAC-SHA256');
		expect(req.body).toBe(JSON.stringify(body));
	});

	it('works identically for auth and guest (same signer, same credentials shape)', async () => {
		await signedFetch('/register-device', { device: {} });
		expect(mockSignRequest.mock.calls[0][1]).toMatchObject({
			signingService: 'execute-api',
		});
		// no Bearer/Authorization branch — only signed headers are used
		const [, req] = mockFetch.mock.calls[0];
		expect(req.headers).toBe(signedHeaders);
		expect(req.headers).not.toHaveProperty('Authorization');
	});

	it('attaches a well-formed x-amz-user-agent header on all three routes', async () => {
		for (const path of [
			'/identify-user',
			'/register-device',
			'/remove-device',
		]) {
			mockSignRequest.mockClear();
			await signedFetch(path, {});
			const ua = mockSignRequest.mock.calls[0][0].headers['x-amz-user-agent'];
			expect(ua).toContain('aws-amplify/');
			expect(ua).toContain('pushnotification');
		}
	});

	it('throws a network error when fetch rejects', async () => {
		mockFetch.mockRejectedValue(new Error('offline'));
		await expect(signedFetch('/identify-user', {})).rejects.toBeInstanceOf(
			PushNotificationError,
		);
	});

	it('throws when the endpoint responds with a non-2xx status', async () => {
		mockFetch.mockResolvedValue({ ok: false, status: 403 });
		await expect(signedFetch('/remove-device', {})).rejects.toBeInstanceOf(
			PushNotificationError,
		);
	});
});
