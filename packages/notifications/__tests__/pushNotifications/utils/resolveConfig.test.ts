// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { resolveConfig } from '../../../src/pushNotifications/providers/pinpoint/utils/resolveConfig';
import { pinpointConfig } from '../../testUtils/data';

describe('resolveConfig', () => {
	// create spies
	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');
	const assertConfiguredSpy = jest.spyOn(Amplify, 'assertConfigured');

	beforeEach(() => {
		getConfigSpy.mockReset();
		assertConfiguredSpy.mockReset();
	});

	it('throws if Amplify is not configured', () => {
		assertConfiguredSpy.mockImplementation(() => {
			throw new Error(
				'Amplify has not been configured. Please call Amplify.configure() before using this service.',
			);
		});

		expect(resolveConfig).toThrow(
			'Amplify has not been configured. Please call Amplify.configure() before using this service.',
		);
	});

	it('returns required config', () => {
		assertConfiguredSpy.mockImplementation(jest.fn());
		getConfigSpy.mockReturnValue({
			Notifications: {
				PushNotification: { Pinpoint: pinpointConfig },
			},
		});
		expect(resolveConfig()).toStrictEqual(pinpointConfig);
	});

	it('throws if appId is missing', () => {
		assertConfiguredSpy.mockImplementation(jest.fn());
		getConfigSpy.mockReturnValue({
			Notifications: {
				PushNotification: {
					Pinpoint: { ...pinpointConfig, appId: undefined } as any,
				},
			},
		});
		expect(resolveConfig).toThrow();
	});

	it('throws if region is missing', () => {
		getConfigSpy.mockReturnValue({
			Notifications: {
				PushNotification: {
					Pinpoint: { ...pinpointConfig, region: undefined } as any,
				},
			},
		});
		expect(resolveConfig).toThrow();
	});
});
