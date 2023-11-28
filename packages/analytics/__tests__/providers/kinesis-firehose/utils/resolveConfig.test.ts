// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { resolveConfig } from '../../../../src/providers/kinesis-firehose/utils';
import { DEFAULT_KINESIS_FIREHOSE_CONFIG } from '../../../../src/providers/kinesis-firehose/utils/constants';

describe('Analytics KinesisFirehose Provider Util: resolveConfig', () => {
	const providedConfig = {
		region: 'us-east-1',
		bufferSize: 100,
		flushSize: 10,
		flushInterval: 1000,
		resendLimit: 3,
	};

	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');

	beforeEach(() => {
		getConfigSpy.mockReset();
	});

	it('returns required config', () => {
		getConfigSpy.mockReturnValue({
			Analytics: { KinesisFirehose: providedConfig },
		});

		expect(resolveConfig()).toStrictEqual(providedConfig);
	});

	it('use default config for optional fields', () => {
		const requiredFields = {
			region: 'us-east-1',
			bufferSize: undefined,
			resendLimit: undefined,
		};
		getConfigSpy.mockReturnValue({
			Analytics: { KinesisFirehose: requiredFields },
		});

		expect(resolveConfig()).toStrictEqual({
			...DEFAULT_KINESIS_FIREHOSE_CONFIG,
			region: requiredFields.region,
			resendLimit: requiredFields.resendLimit,
		});
	});

	it('throws if region is missing', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				KinesisFirehose: { ...providedConfig, region: undefined as any },
			},
		});

		expect(resolveConfig).toThrow();
	});

	it('throws if flushSize is larger than bufferSize', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				KinesisFirehose: {
					...providedConfig,
					flushSize: providedConfig.bufferSize + 1,
				},
			},
		});

		expect(resolveConfig).toThrow();
	});
});
