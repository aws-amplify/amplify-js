// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { resolveConfig } from '../../../src/pushNotifications/providers/pinpoint/utils/resolveConfig';
import { pinpointConfig } from '../../testUtils/data';

describe('resolveConfig', () => {
	// create spies
	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');

	afterEach(() => {
		getConfigSpy.mockReset();
	});

	it('returns required config', () => {
		getConfigSpy.mockReturnValue({
			Notifications: {
				PushNotification: { Pinpoint: pinpointConfig },
			},
		});
		expect(resolveConfig()).toStrictEqual(pinpointConfig);
	});

	it('throws if appId is missing', () => {
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
