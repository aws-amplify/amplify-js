// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';
import { resolveConfig } from '../../../../src/providers/pinpoint/utils';

const mockCtx = createMockAmplifyContext();

describe('Analytics Pinpoint Provider Util: resolveConfig', () => {
	const pinpointConfig = {
		appId: 'app-id',
		region: 'region',
		bufferSize: 100,
		flushSize: 10,
		flushInterval: 50,
		resendLimit: 3,
	};
	// create spies

	it('returns required config', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: { Pinpoint: pinpointConfig },
		};
		expect(resolveConfig(mockCtx)).toStrictEqual(pinpointConfig);
	});

	it('throws if appId is missing', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: {
				Pinpoint: { ...pinpointConfig, appId: undefined } as any,
			},
		};
		expect(() => resolveConfig(mockCtx)).toThrow();
	});

	it('throws if region is missing', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: {
				Pinpoint: { ...pinpointConfig, region: undefined } as any,
			},
		};
		expect(() => resolveConfig(mockCtx)).toThrow();
	});
});
