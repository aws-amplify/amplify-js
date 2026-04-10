// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';
import { resolveConfig } from '../../../src/pushNotifications/providers/pinpoint/utils/resolveConfig';
import { pinpointConfig } from '../../testUtils/data';

const mockCtx = createMockAmplifyContext();

describe('resolveConfig', () => {
	it('returns required config', () => {
		(mockCtx as any).resourcesConfig = {
			Notifications: {
				PushNotification: { Pinpoint: pinpointConfig },
			},
		};
		expect(resolveConfig(mockCtx)).toStrictEqual(pinpointConfig);
	});

	it('throws if appId is missing', () => {
		(mockCtx as any).resourcesConfig = {
			Notifications: {
				PushNotification: {
					Pinpoint: { ...pinpointConfig, appId: undefined } as any,
				},
			},
		};
		expect(resolveConfig).toThrow();
	});

	it('throws if region is missing', () => {
		(mockCtx as any).resourcesConfig = {
			Notifications: {
				PushNotification: {
					Pinpoint: { ...pinpointConfig, region: undefined } as any,
				},
			},
		};
		expect(resolveConfig).toThrow();
	});
});
