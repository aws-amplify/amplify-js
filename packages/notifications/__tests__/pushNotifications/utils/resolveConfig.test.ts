// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../../../src/pushNotifications/providers/pinpoint/utils/resolveConfig';
import { pinpointConfig } from '../../testUtils/data';
import { createMockAmplifyContext } from '../../testUtils/createMockAmplifyContext';

describe('resolveConfig', () => {
	it('returns required config', () => {
		const mockCtx = createMockAmplifyContext({
			Notifications: {
				PushNotification: { Pinpoint: pinpointConfig },
			},
		});
		expect(resolveConfig(mockCtx)).toStrictEqual(pinpointConfig);
	});

	it('throws if appId is missing', () => {
		const mockCtx = createMockAmplifyContext({
			Notifications: {
				PushNotification: {
					Pinpoint: { ...pinpointConfig, appId: undefined },
				},
			},
		});
		expect(() => resolveConfig(mockCtx)).toThrow();
	});

	it('throws if region is missing', () => {
		const mockCtx = createMockAmplifyContext({
			Notifications: {
				PushNotification: {
					Pinpoint: { ...pinpointConfig, region: undefined },
				},
			},
		});
		expect(() => resolveConfig(mockCtx)).toThrow();
	});
});
