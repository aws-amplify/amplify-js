// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

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

	const createCtx = (
		resourcesConfig: Record<string, unknown> = {},
	): AmplifyContext => ({
		resourcesConfig,
		libraryOptions: {},
		fetchAuthSession: jest.fn(),
		clearCredentials: jest.fn(),
		getTokens: jest.fn(),
	});

	it('returns required config', () => {
		expect(
			resolveConfig(
				createCtx({ Analytics: { KinesisFirehose: providedConfig } }),
			),
		).toStrictEqual(providedConfig);
	});

	it('use default config for optional fields', () => {
		const requiredFields = {
			region: 'us-east-1',
			bufferSize: undefined,
			resendLimit: undefined,
		};

		expect(
			resolveConfig(
				createCtx({ Analytics: { KinesisFirehose: requiredFields } }),
			),
		).toStrictEqual({
			...DEFAULT_KINESIS_FIREHOSE_CONFIG,
			region: requiredFields.region,
			resendLimit: requiredFields.resendLimit,
		});
	});

	it('throws if region is missing', () => {
		expect(() =>
			resolveConfig(
				createCtx({
					Analytics: {
						KinesisFirehose: { ...providedConfig, region: undefined },
					},
				}),
			),
		).toThrow();
	});

	it('throws if flushSize is larger than bufferSize', () => {
		expect(() =>
			resolveConfig(
				createCtx({
					Analytics: {
						KinesisFirehose: {
							...providedConfig,
							flushSize: providedConfig.bufferSize + 1,
						},
					},
				}),
			),
		).toThrow();
	});
});
