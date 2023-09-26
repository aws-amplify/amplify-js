// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { resolveConfig } from '../../src/utils';
import { GraphQLAuthMode } from '@aws-amplify/core/lib-esm/singleton/API/types';

describe('GraphQL API Util: resolveConfig', () => {
	const AppSyncConfig = {
		defaultAuthMode: {
			type: 'apiKey',
			apiKey: '0123456789',
		} as GraphQLAuthMode,
		region: 'us-west-2',
		endpoint: 'https://test.us-west-2.amazonaws.com/graphql',
	};

	// create spies
	const getConfigSpy = jest.spyOn(Amplify, 'getConfig');

	beforeEach(() => {
		getConfigSpy.mockReset();
	});

	it('returns required config', () => {
		getConfigSpy.mockReturnValue({
			API: { AppSync: AppSyncConfig },
		});
		expect(resolveConfig()).toStrictEqual(AppSyncConfig);
	});

	it('throws if endpoint is missing', () => {
		getConfigSpy.mockReturnValue({
			API: {
				AppSync: { ...AppSyncConfig, endpoint: undefined } as any,
			},
		});
		expect(resolveConfig).toThrow();
	});

	it('throws if defaultAuthMode is missing', () => {
		getConfigSpy.mockReturnValue({
			API: {
				AppSync: { ...AppSyncConfig, defaultAuthMode: undefined } as any,
			},
		});
		expect(resolveConfig).toThrow();
	});

	it('throws if region is missing', () => {
		getConfigSpy.mockReturnValue({
			API: {
				AppSync: { ...AppSyncConfig, region: undefined } as any,
			},
		});
		expect(resolveConfig).toThrow();
	});
});
