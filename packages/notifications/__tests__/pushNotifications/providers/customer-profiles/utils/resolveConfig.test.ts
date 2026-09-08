// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import { resolveConfig } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveConfig';
import {
	PushNotificationError,
	PushNotificationValidationErrorCode,
} from '../../../../../src/pushNotifications/errors';
import { customerProfilesConfig } from '../../../../testUtils/data';

describe('resolveConfig (customer-profiles)', () => {
	const makeCtx = (config: unknown) =>
		createMockAmplifyContext({
			Notifications: {
				PushNotification: { CustomerProfiles: config as any },
			},
		});

	const expectToThrowWithCode = (
		config: unknown,
		code: PushNotificationValidationErrorCode,
	) => {
		let error: unknown;
		try {
			resolveConfig(makeCtx(config));
		} catch (caught) {
			error = caught;
		}
		expect(error).toBeInstanceOf(PushNotificationError);
		expect((error as PushNotificationError).name).toBe(code);
	};

	it('returns the Customer Profiles endpoint and region for an https endpoint', () => {
		expect(resolveConfig(makeCtx(customerProfilesConfig))).toStrictEqual(
			customerProfilesConfig,
		);
	});

	it('throws NoEndpoint if endpoint is missing', () => {
		expectToThrowWithCode(
			{ ...customerProfilesConfig, endpoint: undefined },
			PushNotificationValidationErrorCode.NoEndpoint,
		);
	});

	it('throws NoRegion if region is missing', () => {
		expectToThrowWithCode(
			{ ...customerProfilesConfig, region: undefined },
			PushNotificationValidationErrorCode.NoRegion,
		);
	});

	it('throws NoEndpoint if the Customer Profiles config is absent', () => {
		const ctx = createMockAmplifyContext({
			Notifications: { PushNotification: {} as any },
		});
		let error: unknown;
		try {
			resolveConfig(ctx);
		} catch (caught) {
			error = caught;
		}
		expect(error).toBeInstanceOf(PushNotificationError);
		expect((error as PushNotificationError).name).toBe(
			PushNotificationValidationErrorCode.NoEndpoint,
		);
	});

	it('throws InvalidEndpoint for an http:// (non-https) endpoint', () => {
		expectToThrowWithCode(
			{
				...customerProfilesConfig,
				endpoint: 'http://abcd1234.execute-api.us-east-1.amazonaws.com/prod',
			},
			PushNotificationValidationErrorCode.InvalidEndpoint,
		);
	});

	it('throws InvalidEndpoint for a non-https scheme (ftp://)', () => {
		expectToThrowWithCode(
			{ ...customerProfilesConfig, endpoint: 'ftp://x' },
			PushNotificationValidationErrorCode.InvalidEndpoint,
		);
	});

	it('throws InvalidEndpoint for a malformed (non-URL) endpoint', () => {
		expectToThrowWithCode(
			{ ...customerProfilesConfig, endpoint: 'not a url' },
			PushNotificationValidationErrorCode.InvalidEndpoint,
		);
	});

	it('accepts an execute-api host without a stage path', () => {
		expect(
			resolveConfig(
				makeCtx({
					...customerProfilesConfig,
					endpoint: 'https://abcd1234.execute-api.us-east-1.amazonaws.com',
				}),
			).endpoint,
		).toBe('https://abcd1234.execute-api.us-east-1.amazonaws.com');
	});

	describe('endpoint host allowlist', () => {
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
			expectToThrowWithCode(
				{ ...customerProfilesConfig, endpoint },
				PushNotificationValidationErrorCode.InvalidEndpoint,
			);
		});

		it('accepts the execute-api host of the configured region', () => {
			const ctx = makeCtx({
				endpoint: 'https://xyz789.execute-api.eu-west-2.amazonaws.com/prod',
				region: 'eu-west-2',
			});
			expect(resolveConfig(ctx)).toStrictEqual({
				endpoint: 'https://xyz789.execute-api.eu-west-2.amazonaws.com/prod',
				region: 'eu-west-2',
			});
		});
	});

	describe('trailing slash normalization', () => {
		it('strips a trailing slash from a host-only endpoint', () => {
			expect(
				resolveConfig(
					makeCtx({
						...customerProfilesConfig,
						endpoint: 'https://abcd1234.execute-api.us-east-1.amazonaws.com/',
					}),
				).endpoint,
			).toBe('https://abcd1234.execute-api.us-east-1.amazonaws.com');
		});

		it('strips trailing slashes while PRESERVING a stage path', () => {
			expect(
				resolveConfig(
					makeCtx({
						...customerProfilesConfig,
						endpoint:
							'https://abcd1234.execute-api.us-east-1.amazonaws.com/prod/',
					}),
				).endpoint,
			).toBe('https://abcd1234.execute-api.us-east-1.amazonaws.com/prod');
		});

		it('strips repeated trailing slashes', () => {
			expect(
				resolveConfig(
					makeCtx({
						...customerProfilesConfig,
						endpoint:
							'https://abcd1234.execute-api.us-east-1.amazonaws.com/prod///',
					}),
				).endpoint,
			).toBe('https://abcd1234.execute-api.us-east-1.amazonaws.com/prod');
		});

		it('produces an endpoint that composes with a route path without a double slash', () => {
			const { endpoint } = resolveConfig(
				makeCtx({
					...customerProfilesConfig,
					endpoint: 'https://abcd1234.execute-api.us-east-1.amazonaws.com/',
				}),
			);
			expect(new URL(`${endpoint}/identify-user`).toString()).toBe(
				'https://abcd1234.execute-api.us-east-1.amazonaws.com/identify-user',
			);
		});
	});
});
