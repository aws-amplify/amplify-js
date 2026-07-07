// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { resolveConfig } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/resolveConfig';
import { customerProfilesConfig } from '../../../../testUtils/data';

describe('resolveConfig (customer-profiles)', () => {
	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');

	afterEach(() => {
		getConfigSpy.mockReset();
	});

	it('returns the Customer Profiles endpoint and region', () => {
		getConfigSpy.mockReturnValue({
			Notifications: {
				PushNotification: { CustomerProfiles: customerProfilesConfig },
			},
		});
		expect(resolveConfig()).toStrictEqual(customerProfilesConfig);
	});

	it('throws if endpoint is missing', () => {
		getConfigSpy.mockReturnValue({
			Notifications: {
				PushNotification: {
					CustomerProfiles: {
						...customerProfilesConfig,
						endpoint: undefined,
					} as any,
				},
			},
		});
		expect(resolveConfig).toThrow();
	});

	it('throws if region is missing', () => {
		getConfigSpy.mockReturnValue({
			Notifications: {
				PushNotification: {
					CustomerProfiles: {
						...customerProfilesConfig,
						region: undefined,
					} as any,
				},
			},
		});
		expect(resolveConfig).toThrow();
	});

	it('throws if the Customer Profiles config is absent', () => {
		getConfigSpy.mockReturnValue({
			Notifications: { PushNotification: {} as any },
		});
		expect(resolveConfig).toThrow();
	});
});
