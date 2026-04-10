// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';
import { resolveConfig } from '../../../../src/providers/kinesis-firehose/utils';
import { DEFAULT_KINESIS_FIREHOSE_CONFIG } from '../../../../src/providers/kinesis-firehose/utils/constants';

const mockCtx = createMockAmplifyContext();

describe('Analytics KinesisFirehose Provider Util: resolveConfig', () => {
	const providedConfig = {
		region: 'us-east-1',
		bufferSize: 100,
		flushSize: 10,
		flushInterval: 1000,
		resendLimit: 3,
	};

	it('returns required config', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: { KinesisFirehose: providedConfig },
		};

		expect(resolveConfig(mockCtx)).toStrictEqual(providedConfig);
	});

	it('use default config for optional fields', () => {
		const requiredFields = {
			region: 'us-east-1',
			bufferSize: undefined,
			resendLimit: undefined,
		};
		(mockCtx as any).resourcesConfig = {
			Analytics: { KinesisFirehose: requiredFields },
		};

		expect(resolveConfig(mockCtx)).toStrictEqual({
			...DEFAULT_KINESIS_FIREHOSE_CONFIG,
			region: requiredFields.region,
			resendLimit: requiredFields.resendLimit,
		});
	});

	it('throws if region is missing', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: {
				KinesisFirehose: { ...providedConfig, region: undefined as any },
			},
		};

		expect(() => resolveConfig(mockCtx)).toThrow();
	});

	it('throws if flushSize is larger than bufferSize', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: {
				KinesisFirehose: {
					...providedConfig,
					flushSize: providedConfig.bufferSize + 1,
				},
			},
		};

		expect(() => resolveConfig(mockCtx)).toThrow();
	});
});
