// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { resolveConfig } from '../../src/utils';
import { GraphQLAuthModeKeys } from '@aws-amplify/core/internals/utils';

describe('GraphQL API Util: resolveConfig', () => {
	const GraphQLConfig = {
		defaultAuthMode: {
			type: 'apiKey' as GraphQLAuthModeKeys,
			apiKey: '0123456789',
		},
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
			API: { GraphQL: GraphQLConfig },
		});
		expect(resolveConfig()).toStrictEqual(GraphQLConfig);
	});

	it('throws if endpoint is missing', () => {
		getConfigSpy.mockReturnValue({
			API: {
				GraphQL: { ...GraphQLConfig, endpoint: undefined } as any,
			},
		});
		expect(resolveConfig).toThrow();
	});

	it('throws if defaultAuthMode is missing', () => {
		getConfigSpy.mockReturnValue({
			API: {
				GraphQL: { ...GraphQLConfig, defaultAuthMode: undefined } as any,
			},
		});
		expect(resolveConfig).toThrow();
	});

	it('throws if region is missing', () => {
		getConfigSpy.mockReturnValue({
			API: {
				GraphQL: { ...GraphQLConfig, region: undefined } as any,
			},
		});
		expect(resolveConfig).toThrow();
	});
});
