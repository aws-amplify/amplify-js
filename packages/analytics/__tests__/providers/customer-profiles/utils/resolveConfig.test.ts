// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { resolveConfig } from '../../../../src/providers/customer-profiles/utils';

describe('Analytics Customer Profiles Provider Util: resolveConfig', () => {
	const customerProfilesConfig = {
		endpoint: 'https://example.com/prod',
		region: 'region',
	};
	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');

	beforeEach(() => {
		getConfigSpy.mockReset();
	});

	it('returns required config', () => {
		getConfigSpy.mockReturnValue({
			Analytics: { CustomerProfiles: customerProfilesConfig },
		});
		expect(resolveConfig()).toStrictEqual(customerProfilesConfig);
	});

	it('throws if endpoint is missing', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				CustomerProfiles: {
					...customerProfilesConfig,
					endpoint: undefined,
				} as any,
			},
		});
		expect(resolveConfig).toThrow();
	});

	it('throws if region is missing', () => {
		getConfigSpy.mockReturnValue({
			Analytics: {
				CustomerProfiles: {
					...customerProfilesConfig,
					region: undefined,
				} as any,
			},
		});
		expect(resolveConfig).toThrow();
	});
});
