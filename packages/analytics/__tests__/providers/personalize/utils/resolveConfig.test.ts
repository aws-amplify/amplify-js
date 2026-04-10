// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';
import {
	DEFAULT_PERSONALIZE_CONFIG,
	PERSONALIZE_FLUSH_SIZE_MAX,
	resolveConfig,
} from '../../../../src/providers/personalize/utils';

const mockCtx = createMockAmplifyContext();

describe('Analytics Personalize Provider Util: resolveConfig', () => {
	const providedConfig = {
		region: 'us-east-1',
		trackingId: 'trackingId0',
		flushSize: 10,
		flushInterval: 1000,
	};

	it('returns required config', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: { Personalize: providedConfig },
		};

		expect(resolveConfig(mockCtx)).toStrictEqual({
			...providedConfig,
			bufferSize: providedConfig.flushSize + 1,
		});
	});

	it('use default config for optional fields', () => {
		const requiredFields = {
			region: 'us-east-1',
			trackingId: 'trackingId1',
		};
		(mockCtx as any).resourcesConfig = {
			Analytics: { Personalize: requiredFields },
		};

		expect(resolveConfig(mockCtx)).toStrictEqual({
			...DEFAULT_PERSONALIZE_CONFIG,
			region: requiredFields.region,
			trackingId: requiredFields.trackingId,
			bufferSize: DEFAULT_PERSONALIZE_CONFIG.flushSize + 1,
		});
	});

	it('throws if region is missing', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: {
				Personalize: { ...providedConfig, region: undefined as any },
			},
		};

		expect(() => resolveConfig(mockCtx)).toThrow();
	});

	it('throws if flushSize is larger than max', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: {
				Personalize: {
					...providedConfig,
					flushSize: PERSONALIZE_FLUSH_SIZE_MAX + 1,
				},
			},
		};

		expect(() => resolveConfig(mockCtx)).toThrow();
	});
});
