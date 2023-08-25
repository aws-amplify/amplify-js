// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { resolveConfig } from '../../../../src/providers/pinpoint/utils';

describe('Analytics Pinpoint Provider Util: resolveConfig', () => {
	const pinpointConfig = {
		appId: 'app-id',
		region: 'region',
	};
	// create spies
	const getConfigSpy = jest.spyOn(AmplifyV6, 'getConfig');

	beforeEach(() => {
		getConfigSpy.mockReset();
	});

	it('returns required config', () => {
		getConfigSpy.mockReturnValue({
			Analytics: { AWSPinpoint: pinpointConfig },
		});
		expect(resolveConfig()).toStrictEqual(pinpointConfig);
	});

	it('throws if appId is missing', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				AWSPinpoint: { ...pinpointConfig, appId: undefined } as any,
			},
		});
		expect(resolveConfig).toThrow();
	});

	it('throws if region is missing', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				AWSPinpoint: { ...pinpointConfig, region: undefined } as any,
			},
		});
		expect(resolveConfig).toThrow();
	});
});
