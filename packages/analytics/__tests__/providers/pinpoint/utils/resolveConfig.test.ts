// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../../../../src/providers/pinpoint/utils';

describe('Analytics Pinpoint Provider Util: resolveConfig', () => {
	const pinpointConfig = {
		appId: 'app-id',
		region: 'region',
		bufferSize: 100,
		flushSize: 10,
		flushInterval: 50,
		resendLimit: 3,
	};

	const createCtx = (analyticsConfig: Record<string, unknown> = {}) =>
		({
			resourcesConfig: { Analytics: analyticsConfig },
			libraryOptions: {},
			fetchAuthSession: jest.fn(),
			clearCredentials: jest.fn(),
			getTokens: jest.fn(),
		}) as any;

	it('returns required config', () => {
		expect(
			resolveConfig(createCtx({ Pinpoint: pinpointConfig })),
		).toStrictEqual(pinpointConfig);
	});

	it('throws if appId is missing', () => {
		expect(() =>
			resolveConfig(
				createCtx({ Pinpoint: { ...pinpointConfig, appId: undefined } }),
			),
		).toThrow();
	});

	it('throws if region is missing', () => {
		expect(() =>
			resolveConfig(
				createCtx({ Pinpoint: { ...pinpointConfig, region: undefined } }),
			),
		).toThrow();
	});
});
