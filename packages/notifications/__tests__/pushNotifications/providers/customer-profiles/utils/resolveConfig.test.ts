// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { resolveConfig } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveConfig';
import {
	PushNotificationError,
	PushNotificationValidationErrorCode,
} from '../../../../../src/pushNotifications/errors';
import { customerProfilesConfig } from '../../../../testUtils/data';

describe('resolveConfig (customer-profiles)', () => {
	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');

	const mockCustomerProfilesConfig = (config: unknown) => {
		getConfigSpy.mockReturnValue({
			Notifications: {
				PushNotification: { CustomerProfiles: config as any },
			},
		});
	};

	const expectToThrowWithCode = (code: PushNotificationValidationErrorCode) => {
		let error: unknown;
		try {
			resolveConfig();
		} catch (caught) {
			error = caught;
		}
		expect(error).toBeInstanceOf(PushNotificationError);
		expect((error as PushNotificationError).name).toBe(code);
	};

	afterEach(() => {
		getConfigSpy.mockReset();
	});

	it('returns the Customer Profiles endpoint and region for an https endpoint', () => {
		mockCustomerProfilesConfig(customerProfilesConfig);
		expect(resolveConfig()).toStrictEqual(customerProfilesConfig);
	});

	it('throws NoEndpoint if endpoint is missing', () => {
		mockCustomerProfilesConfig({
			...customerProfilesConfig,
			endpoint: undefined,
		});
		expectToThrowWithCode(PushNotificationValidationErrorCode.NoEndpoint);
	});

	it('throws NoRegion if region is missing', () => {
		mockCustomerProfilesConfig({
			...customerProfilesConfig,
			region: undefined,
		});
		expectToThrowWithCode(PushNotificationValidationErrorCode.NoRegion);
	});

	it('throws NoEndpoint if the Customer Profiles config is absent', () => {
		getConfigSpy.mockReturnValue({
			Notifications: { PushNotification: {} as any },
		});
		expectToThrowWithCode(PushNotificationValidationErrorCode.NoEndpoint);
	});

	it('throws InvalidEndpoint for an http:// (non-https) endpoint', () => {
		mockCustomerProfilesConfig({
			...customerProfilesConfig,
			endpoint: 'http://abcd1234.execute-api.us-east-1.amazonaws.com/prod',
		});
		expectToThrowWithCode(PushNotificationValidationErrorCode.InvalidEndpoint);
	});

	it('throws InvalidEndpoint for a non-https scheme (ftp://)', () => {
		mockCustomerProfilesConfig({
			...customerProfilesConfig,
			endpoint: 'ftp://x',
		});
		expectToThrowWithCode(PushNotificationValidationErrorCode.InvalidEndpoint);
	});

	it('throws InvalidEndpoint for a malformed (non-URL) endpoint', () => {
		mockCustomerProfilesConfig({
			...customerProfilesConfig,
			endpoint: 'not a url',
		});
		expectToThrowWithCode(PushNotificationValidationErrorCode.InvalidEndpoint);
	});

	it('accepts an execute-api host without a stage path', () => {
		mockCustomerProfilesConfig({
			...customerProfilesConfig,
			endpoint: 'https://abcd1234.execute-api.us-east-1.amazonaws.com',
		});
		expect(resolveConfig().endpoint).toBe(
			'https://abcd1234.execute-api.us-east-1.amazonaws.com',
		);
	});

	describe('endpoint host allowlist', () => {
		// SigV4 execute-api credentials travel with every request to this
		// endpoint, so a non-API-Gateway host MUST be rejected outright.
		it.each([
			['an unrelated host', 'https://evil.com'],
			['an unrelated host with a plausible path', 'https://evil.com/prod'],
			[
				'a host that only looks like execute-api',
				'https://attacker.execute-api-fake.com',
			],
			[
				'an execute-api lookalike on another domain',
				'https://abcd1234.execute-api.us-east-1.amazonaws.com.evil.com',
			],
			[
				'an execute-api host in a different region',
				'https://abcd1234.execute-api.eu-west-1.amazonaws.com',
			],
			[
				'an execute-api host with an empty api id',
				'https://execute-api.us-east-1.amazonaws.com',
			],
			[
				'credentials embedded to spoof the host',
				'https://abcd1234.execute-api.us-east-1.amazonaws.com@evil.com',
			],
		])('throws InvalidEndpoint for %s', (_, endpoint) => {
			mockCustomerProfilesConfig({ ...customerProfilesConfig, endpoint });
			expectToThrowWithCode(
				PushNotificationValidationErrorCode.InvalidEndpoint,
			);
		});

		it('accepts the execute-api host of the configured region', () => {
			mockCustomerProfilesConfig({
				endpoint: 'https://xyz789.execute-api.eu-west-2.amazonaws.com/prod',
				region: 'eu-west-2',
			});
			expect(resolveConfig()).toStrictEqual({
				endpoint: 'https://xyz789.execute-api.eu-west-2.amazonaws.com/prod',
				region: 'eu-west-2',
			});
		});
	});

	describe('trailing slash normalization', () => {
		it('strips a trailing slash from a host-only endpoint', () => {
			mockCustomerProfilesConfig({
				...customerProfilesConfig,
				endpoint: 'https://abcd1234.execute-api.us-east-1.amazonaws.com/',
			});
			expect(resolveConfig().endpoint).toBe(
				'https://abcd1234.execute-api.us-east-1.amazonaws.com',
			);
		});

		it('strips trailing slashes while PRESERVING a stage path', () => {
			mockCustomerProfilesConfig({
				...customerProfilesConfig,
				endpoint: 'https://abcd1234.execute-api.us-east-1.amazonaws.com/prod/',
			});
			expect(resolveConfig().endpoint).toBe(
				'https://abcd1234.execute-api.us-east-1.amazonaws.com/prod',
			);
		});

		it('strips repeated trailing slashes', () => {
			mockCustomerProfilesConfig({
				...customerProfilesConfig,
				endpoint:
					'https://abcd1234.execute-api.us-east-1.amazonaws.com/prod///',
			});
			expect(resolveConfig().endpoint).toBe(
				'https://abcd1234.execute-api.us-east-1.amazonaws.com/prod',
			);
		});

		it('produces an endpoint that composes with a route path without a double slash', () => {
			mockCustomerProfilesConfig({
				...customerProfilesConfig,
				endpoint: 'https://abcd1234.execute-api.us-east-1.amazonaws.com/',
			});
			const { endpoint } = resolveConfig();
			expect(new URL(`${endpoint}/identify-user`).toString()).toBe(
				'https://abcd1234.execute-api.us-east-1.amazonaws.com/identify-user',
			);
		});
	});
});
