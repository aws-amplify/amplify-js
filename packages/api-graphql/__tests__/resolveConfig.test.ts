// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveConfig } from '../src/utils';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';
import { AmplifyClassV6 } from '@aws-amplify/core';

describe('GraphQL API Util: resolveConfig', () => {
	const GraphQLConfig = {
		endpoint: 'https://test.us-west-2.amazonaws.com/graphql',
		region: 'us-west-2',
		apiKey: 'mock-api-key',
		defaultAuthMode: {
			type: 'apiKey' as GraphQLAuthMode,
			apiKey: '0123456789',
		},
	};

	it('returns required config', () => {
		const amplify = {
			getConfig: jest.fn(() => {
				return {
					API: { GraphQL: GraphQLConfig },
				};
			}),
		} as unknown as AmplifyClassV6;

		const expected = {
			...GraphQLConfig,
			customEndpoint: undefined,
			customEndpointRegion: undefined,
		};

		expect(resolveConfig(amplify)).toStrictEqual(expected);
	});

	it('throws if custom endpoint region exists without custom endpoint:', () => {
		const amplify = {
			getConfig: jest.fn(() => {
				return {
					API: {
						GraphQL: {
							...GraphQLConfig,
							customEndpoint: undefined,
							customEndpointRegion: 'some-region',
						},
					},
				};
			}),
		} as unknown as AmplifyClassV6;

		expect(() => resolveConfig(amplify)).toThrow();
	});
});
