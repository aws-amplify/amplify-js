// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../src/utils';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';
import { AmplifyContext } from '@aws-amplify/core';

describe('GraphQL API Util: resolveConfig', () => {
	const GraphQLConfig = {
		endpoint: 'https://test.us-west-2.amazonaws.com/graphql',
		region: 'us-west-2',
		apiKey: 'mock-api-key',
		defaultAuthMode: 'apiKey' as GraphQLAuthMode,
	};

	it('returns required config', () => {
		const mockCtx: AmplifyContext = {
			resourcesConfig: {
				API: { GraphQL: GraphQLConfig },
			},
			libraryOptions: {},
			fetchAuthSession: jest.fn().mockResolvedValue({}),
			clearCredentials: jest.fn(),
			getTokens: jest.fn(),
		};

		const expected = {
			...GraphQLConfig,
			customEndpoint: undefined,
			customEndpointRegion: undefined,
		};

		expect(resolveConfig(mockCtx)).toStrictEqual(expected);
	});

	it('throws if custom endpoint region exists without custom endpoint:', () => {
		const mockCtx: AmplifyContext = {
			resourcesConfig: {
				API: {
					GraphQL: {
						...GraphQLConfig,
						customEndpoint: undefined,
						customEndpointRegion: 'some-region',
					},
				},
			},
			libraryOptions: {},
			fetchAuthSession: jest.fn().mockResolvedValue({}),
			clearCredentials: jest.fn(),
			getTokens: jest.fn(),
		};

		expect(() => resolveConfig(mockCtx)).toThrow();
	});
});
