// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { resolveConfig } from '../../../../src/providers/personalize/utils';
import {
	DEFAULT_PERSONALIZE_CONFIG,
	PERSONALIZE_FLUSH_SIZE_MAX,
} from '../../../../src/providers/personalize/utils';

describe('Analytics Personalize Provider Util: resolveConfig', () => {
	const providedConfig = {
		region: 'us-east-1',
		trackingId: 'trackingId0',
		flushSize: 10,
		flushInterval: 1000,
	};

	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');

	beforeEach(() => {
		getConfigSpy.mockReset();
	});

	it('returns required config', () => {
		getConfigSpy.mockReturnValue({
			Analytics: { Personalize: providedConfig },
		});

		expect(resolveConfig()).toStrictEqual({
			...providedConfig,
			bufferSize: providedConfig.flushSize + 1,
		});
	});

	it('use default config for optional fields', () => {
		const requiredFields = {
			region: 'us-east-1',
			trackingId: 'trackingId1',
		};
		getConfigSpy.mockReturnValue({
			Analytics: { Personalize: requiredFields },
		});

		expect(resolveConfig()).toStrictEqual({
			...DEFAULT_PERSONALIZE_CONFIG,
			region: requiredFields.region,
			trackingId: requiredFields.trackingId,
			bufferSize: DEFAULT_PERSONALIZE_CONFIG.flushSize + 1,
		});
	});

	it('throws if region is missing', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				Personalize: { ...providedConfig, region: undefined as any },
			},
		});

		expect(resolveConfig).toThrow();
	});

	it('throws if flushSize is larger than max', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				Personalize: {
					...providedConfig,
					flushSize: PERSONALIZE_FLUSH_SIZE_MAX + 1,
				},
			},
		});

		expect(resolveConfig).toThrow();
	});
});
