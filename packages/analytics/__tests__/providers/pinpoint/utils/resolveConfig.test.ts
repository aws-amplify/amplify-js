// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

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
			resolveConfig(createCtx({ Analytics: { Pinpoint: pinpointConfig } })),
		).toStrictEqual(pinpointConfig);
	});

	it('throws if appId is missing', () => {
		expect(() =>
			resolveConfig(
				createCtx({
					Analytics: { Pinpoint: { ...pinpointConfig, appId: undefined } },
				}),
			),
		).toThrow();
	});

	it('throws if region is missing', () => {
		expect(() =>
			resolveConfig(
				createCtx({
					Analytics: { Pinpoint: { ...pinpointConfig, region: undefined } },
				}),
			),
		).toThrow();
	});
});
