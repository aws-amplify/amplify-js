// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../../../../src/providers/kinesis/utils/resolveConfig';
import { DEFAULT_KINESIS_CONFIG } from '../../../../src/providers/kinesis/utils/constants';

describe('Analytics Kinesis Provider Util: resolveConfig', () => {
	const kinesisConfig = {
		region: 'us-east-1',
		bufferSize: 100,
		flushSize: 10,
		flushInterval: 1000,
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
		expect(resolveConfig(createCtx({ Kinesis: kinesisConfig }))).toStrictEqual(
			kinesisConfig,
		);
	});

	it('use default config for optional fields', () => {
		const requiredFields = {
			region: 'us-east-1',
			bufferSize: undefined,
			resendLimit: undefined,
		};

		expect(resolveConfig(createCtx({ Kinesis: requiredFields }))).toStrictEqual(
			{
				...DEFAULT_KINESIS_CONFIG,
				region: requiredFields.region,
				resendLimit: requiredFields.resendLimit,
			},
		);
	});

	it('throws if region is missing', () => {
		expect(() =>
			resolveConfig(
				createCtx({ Kinesis: { ...kinesisConfig, region: undefined } }),
			),
		).toThrow();
	});

	it('throws if flushSize is larger than bufferSize', () => {
		expect(() =>
			resolveConfig(
				createCtx({
					Kinesis: {
						...kinesisConfig,
						flushSize: kinesisConfig.bufferSize + 1,
					},
				}),
			),
		).toThrow();
	});
});
