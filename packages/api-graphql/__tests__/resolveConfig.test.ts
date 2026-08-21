// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../src/utils';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';
import { createMockAmplifyContext } from './testUtils/mockAmplifyContext';

describe('GraphQL API Util: resolveConfig', () => {
	const GraphQLConfig = {
		endpoint: 'https://test.us-west-2.amazonaws.com/graphql',
		region: 'us-west-2',
		apiKey: 'mock-api-key',
		defaultAuthMode: 'apiKey' as GraphQLAuthMode,
	};

	it('returns required config', () => {
		const amplify = createMockAmplifyContext({
			API: { GraphQL: GraphQLConfig },
		});

		const expected = {
			...GraphQLConfig,
			customEndpoint: undefined,
			customEndpointRegion: undefined,
		};

		expect(resolveConfig(amplify)).toStrictEqual(expected);
	});

	it('throws if custom endpoint region exists without custom endpoint:', () => {
		const amplify = createMockAmplifyContext({
			API: {
				GraphQL: {
					...GraphQLConfig,
					customEndpoint: undefined,
					customEndpointRegion: 'some-region',
				},
			},
		});

		expect(() => resolveConfig(amplify)).toThrow();
	});
});
