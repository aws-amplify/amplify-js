// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { generateClient } from '../../src/server';
import { generateClientWithAmplifyInstance } from '../../src/internals/server';
import {
	CommonPublicClientOptions,
	ServerClientGenerationParams,
	__amplify,
	__authMode,
	__authToken,
} from '../../src/types';
import { ResourcesConfig } from '@aws-amplify/core';

jest.mock('@aws-amplify/core/internals/adapter-core');
jest.mock('../../src/internals/server', () => ({
	...jest.requireActual('../../src/internals/server'),
	generateClientWithAmplifyInstance: jest.fn(
		(params: ServerClientGenerationParams & CommonPublicClientOptions) => ({
			[__amplify]: params.amplify,
			[__authMode]: params.authMode,
			[__authToken]: params.authToken,
			graphql: mockGraphQLMethod,
			cancel: jest.fn(),
			isCancelError: jest.fn(),
		}),
	),
}));

const mockGraphQLMethod = jest.fn();
const mockGetAmplifyServerContext = getAmplifyServerContext as jest.Mock;
const mockGenerateClientWithAmplifyInstance =
	generateClientWithAmplifyInstance as jest.Mock;
const mockResourceConfig: ResourcesConfig = {
	API: {
		GraphQL: {
			endpoint: 'https://graphql.com',
			defaultAuthMode: 'apiKey',
		},
	},
};

describe('generateClient server edition', () => {
	const testParams: Parameters<typeof generateClient>[0] = {
		config: mockResourceConfig,
		authMode: 'oidc',
		authToken: 'some-token',
	};
	const client = generateClient(testParams);

	afterEach(() => {
		mockGenerateClientWithAmplifyInstance.mockClear();
		mockGraphQLMethod.mockClear();
	});

	describe('calling to create the client', () => {
		it('invokes `generateClientWithAmplifyInstance` with expected params', () => {
			expect(mockGenerateClientWithAmplifyInstance).toHaveBeenCalledTimes(1);
			expect(mockGenerateClientWithAmplifyInstance).toHaveBeenCalledWith({
				amplify: null,
				config: testParams.config,
				authMode: testParams.authMode,
				authToken: testParams.authToken,
			});
		});
	});

	describe('calling the `graphql` method of the created client', () => {
		const mockContextSpec: AmplifyServer.ContextSpec = {
			token: {
				value: Symbol('AmplifyServerContextToken'),
			},
		};
		const mockAmplifyInstanceFromTheContext = jest.fn();

		beforeEach(() => {
			mockGetAmplifyServerContext.mockReturnValue({
				amplify: mockAmplifyInstanceFromTheContext,
			});
		});

		afterEach(() => {
			mockGetAmplifyServerContext.mockClear();
		});

		it('invokes `getAmplifyServerContext` to get the context', () => {
			client.graphql(mockContextSpec, {
				query: 'some query',
			});

			expect(mockGetAmplifyServerContext).toHaveBeenCalledTimes(1);
			expect(mockGetAmplifyServerContext).toHaveBeenCalledWith(mockContextSpec);
		});

		it('invokes the underlying client (crated by `generateClientWithAmplifyInstance`) `graphql` method with expected params', () => {
			const testGraphQLOptions = {
				query: 'some query',
			};
			const testAdditionalHeaders = {
				myHeader: 'myValue',
			};
			client.graphql(
				mockContextSpec,
				testGraphQLOptions,
				testAdditionalHeaders,
			);

			expect(mockGraphQLMethod).toHaveBeenCalledTimes(1);
			expect(mockGraphQLMethod).toHaveBeenCalledWith(
				testGraphQLOptions,
				testAdditionalHeaders,
			);
		});
	});
});
