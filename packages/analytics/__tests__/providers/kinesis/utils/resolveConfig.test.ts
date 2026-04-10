// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';
import { resolveConfig } from '../../../../src/providers/kinesis/utils/resolveConfig';
import { DEFAULT_KINESIS_CONFIG } from '../../../../src/providers/kinesis/utils/constants';

const mockCtx = createMockAmplifyContext();

describe('Analytics Kinesis Provider Util: resolveConfig', () => {
	const kinesisConfig = {
		region: 'us-east-1',
		bufferSize: 100,
		flushSize: 10,
		flushInterval: 1000,
		resendLimit: 3,
	};

	it('returns required config', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: { Kinesis: kinesisConfig },
		};

		expect(resolveConfig(mockCtx)).toStrictEqual(kinesisConfig);
	});

	it('use default config for optional fields', () => {
		const requiredFields = {
			region: 'us-east-1',
			bufferSize: undefined,
			resendLimit: undefined,
		};
		(mockCtx as any).resourcesConfig = {
			Analytics: { Kinesis: requiredFields },
		};

		expect(resolveConfig(mockCtx)).toStrictEqual({
			...DEFAULT_KINESIS_CONFIG,
			region: requiredFields.region,
			resendLimit: requiredFields.resendLimit,
		});
	});

	it('throws if region is missing', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: { Kinesis: { ...kinesisConfig, region: undefined as any } },
		};

		expect(() => resolveConfig(mockCtx)).toThrow();
	});

	it('throws if flushSize is larger than bufferSize', () => {
		(mockCtx as any).resourcesConfig = {
			Analytics: {
				Kinesis: { ...kinesisConfig, flushSize: kinesisConfig.bufferSize + 1 },
			},
		};

		expect(() => resolveConfig(mockCtx)).toThrow();
	});
});
