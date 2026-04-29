// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DEFAULT_PERSONALIZE_CONFIG,
	PERSONALIZE_FLUSH_SIZE_MAX,
	resolveConfig,
} from '../../../../src/providers/personalize/utils';

describe('Analytics Personalize Provider Util: resolveConfig', () => {
	const providedConfig = {
		region: 'us-east-1',
		trackingId: 'trackingId0',
		flushSize: 10,
		flushInterval: 1000,
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
			resolveConfig(createCtx({ Personalize: providedConfig })),
		).toStrictEqual({
			...providedConfig,
			bufferSize: providedConfig.flushSize + 1,
		});
	});

	it('use default config for optional fields', () => {
		const requiredFields = {
			region: 'us-east-1',
			trackingId: 'trackingId1',
		};

		expect(
			resolveConfig(createCtx({ Personalize: requiredFields })),
		).toStrictEqual({
			...DEFAULT_PERSONALIZE_CONFIG,
			region: requiredFields.region,
			trackingId: requiredFields.trackingId,
			bufferSize: DEFAULT_PERSONALIZE_CONFIG.flushSize + 1,
		});
	});

	it('throws if region is missing', () => {
		expect(() =>
			resolveConfig(
				createCtx({
					Personalize: { ...providedConfig, region: undefined },
				}),
			),
		).toThrow();
	});

	it('throws if flushSize is larger than max', () => {
		expect(() =>
			resolveConfig(
				createCtx({
					Personalize: {
						...providedConfig,
						flushSize: PERSONALIZE_FLUSH_SIZE_MAX + 1,
					},
				}),
			),
		).toThrow();
	});
});
