// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../../../src/pushNotifications/providers/pinpoint/utils/resolveConfig';
import { createMockAmplifyContext } from '../../testUtils/createMockAmplifyContext';
import { pinpointConfig } from '../../testUtils/data';

describe('resolveConfig', () => {
	it('returns required config', () => {
		const ctx = createMockAmplifyContext({
			Notifications: {
				PushNotification: { Pinpoint: pinpointConfig },
			},
		});
		expect(resolveConfig(ctx)).toStrictEqual(pinpointConfig);
	});

	it('throws if appId is missing', () => {
		const ctx = createMockAmplifyContext({
			Notifications: {
				PushNotification: {
					Pinpoint: { ...pinpointConfig, appId: undefined } as any,
				},
			},
		});
		expect(() => resolveConfig(ctx)).toThrow();
	});

	it('throws if region is missing', () => {
		const ctx = createMockAmplifyContext({
			Notifications: {
				PushNotification: {
					Pinpoint: { ...pinpointConfig, region: undefined } as any,
				},
			},
		});
		expect(() => resolveConfig(ctx)).toThrow();
	});
});
