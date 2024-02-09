// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
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
	// create spies
	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');

	beforeEach(() => {
		getConfigSpy.mockReset();
	});

	it('returns required config', () => {
		getConfigSpy.mockReturnValue({
			Analytics: { Pinpoint: pinpointConfig },
		});
		expect(resolveConfig()).toStrictEqual(pinpointConfig);
	});

	it('throws if appId is missing', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				Pinpoint: { ...pinpointConfig, appId: undefined } as any,
			},
		});
		expect(resolveConfig).toThrow();
	});

	it('throws if region is missing', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				Pinpoint: { ...pinpointConfig, region: undefined } as any,
			},
		});
		expect(resolveConfig).toThrow();
	});
});
