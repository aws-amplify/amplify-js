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
			endpoint: 'http://customer-profiles.example.com/prod',
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
});
