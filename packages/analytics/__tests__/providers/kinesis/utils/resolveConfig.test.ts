// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { resolveConfig } from '../../../../src/providers/kinesis/utils/resolveConfig';
import { DEFAULT_KINESIS_CONFIG } from '../../../../src/providers/kinesis/utils/constants';

describe('Analytics Kinesis Provider Util: resolveConfig', () => {
	const kinesisConfig = {
		region: 'us-east-1',
		bufferSize: 100,
		flushSize: 10,
		flushInterval: 1000,
		resendLimit: 5,
	};

	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');

	beforeEach(() => {
		getConfigSpy.mockReset();
	});

	it('returns required config', () => {
		getConfigSpy.mockReturnValue({
			Analytics: { Kinesis: kinesisConfig },
		});

		expect(resolveConfig()).toStrictEqual(kinesisConfig);
	});

	it('use default config for optional fields', () => {
		const requiredFields = {
			region: 'us-east-1',
		};
		getConfigSpy.mockReturnValue({
			Analytics: { Kinesis: requiredFields },
		});

		expect(resolveConfig()).toStrictEqual({
			...DEFAULT_KINESIS_CONFIG,
			...requiredFields,
		});
	});

	it('throws if region is missing', () => {
		getConfigSpy.mockReturnValue({
			Analytics: { Kinesis: { ...kinesisConfig, region: undefined } },
		});

		expect(resolveConfig).toThrow();
	});

	it('throws if flushSize is larger than bufferSize', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				Kinesis: { ...kinesisConfig, flushSize: kinesisConfig.bufferSize + 1 },
			},
		});

		expect(resolveConfig).toThrow();
	});
});
