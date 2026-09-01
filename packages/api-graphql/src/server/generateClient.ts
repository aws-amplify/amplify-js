// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from '@aws-amplify/core';

import { generateClientWithAmplifyInstance } from '../internals/server';
import { GenerateServerClientParams, V6ClientSSRRequest } from '../types';

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
export function generateClient<
	T extends Record<any, any> = never,
	Options extends GenerateServerClientParams = { config: ResourcesConfig },
>(options: Options): V6ClientSSRRequest<T, Options> {
	// Pattern 6 (post-Phase C3): `client.graphql` natively accepts the
	// per-request branded `AmplifyContext` as its first argument (see
	// `internals/v6.ts`), so the per-client `graphql` wrapper this entry used
	// to carry is gone — this is a bare pass-through, mirroring the other
	// categories' server entries.
	// Passing `null` instance because each method must receive a valid context
	// from the per-request argument.
	return generateClientWithAmplifyInstance<T, V6ClientSSRRequest<T>>({
		amplify: null,
		...options,
	});
}
