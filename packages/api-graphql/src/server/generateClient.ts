// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { CustomHeaders } from '@aws-amplify/data-schema/runtime';

import { generateClientWithAmplifyInstance } from '../internals/server';
import {
	GenerateServerClientParams,
	GraphQLMethod,
	GraphQLMethodSSR,
	GraphQLOptionsV6,
	V6ClientSSRRequest,
	__amplify,
} from '../types';

/**
 * Generates an GraphQL API client that works with Amplify server context.
 *
 * @example
 * import config from './amplifyconfiguration.json';
 * import { listPosts } from './graphql/queries';
 *
 * const client = generateServerClient({ config });
 *
 * const result = await runWithAmplifyServerContext({
 *   nextServerContext: { request, response },
 *   operation: (contextSpec) => client.graphql(contextSpec, {
 *     query: listPosts,
 *   }),
 * });
 */
export function generateClient<T extends Record<any, any> = never>({
	config,
	authMode,
	authToken,
}: GenerateServerClientParams): V6ClientSSRRequest<T> {
	// passing `null` instance because each (future model) method must retrieve a valid instance
	// from server context
	const client = generateClientWithAmplifyInstance<T, V6ClientSSRRequest<T>>({
		amplify: null,
		config,
		authMode,
		authToken,
	});

	// TODO: improve this and the next type
	const prevGraphql = client.graphql as unknown as GraphQLMethod;

	const wrappedGraphql = (
		contextSpec: AmplifyServer.ContextSpec,
		options: GraphQLOptionsV6,
		additionalHeaders?: CustomHeaders,
	) => {
		const amplifyInstance = getAmplifyServerContext(contextSpec).amplify;

		return prevGraphql.call(
			{ [__amplify]: amplifyInstance },
			options,
			additionalHeaders as any,
		);
	};

	client.graphql = wrappedGraphql as unknown as GraphQLMethodSSR;

	return client;
}
