// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateClient as internalGenerateClient } from '@aws-amplify/api/server';
import {
	getAmplifyServerContext,
	AmplifyServerContextError,
} from '@aws-amplify/core/internals/adapter-core';
import {
	V6Client,
	V6ClientSSRRequest,
	V6ClientSSRCookies,
	GraphQLMethod,
	GraphQLMethodSSR,
	__amplify,
} from '@aws-amplify/api-graphql';
import { NextServer } from '../types';
import { createServerRunnerForAPI } from './createServerRunnerForAPI';
import { getAmplifyConfig } from '../utils';

/**
 * Generates an API client that can be used inside a Next.js Server Component with Dynamic Rendering
 *
 * @example
 * ```ts
 * import { cookies } from "next/headers"
 *
 * const client = generateServerClientUsingCookies({ cookies })
 * const result = await client.graphql({query: listPosts})
 * ```
 */
export function generateServerClientUsingCookies<
	T extends Record<any, any> = never
>({
	config,
	cookies,
}: NextServer.ServerComponentContext &
	NextServer.CreateServerRunnerInput): V6Client<T> {
	if (typeof cookies !== 'function') {
		throw new AmplifyServerContextError({
			message:
				'generateServerClientUsingCookies is only compatible with the `cookies` Dynamic Function available in Server Components.',
			// TODO: link to docs
			recoverySuggestion:
				'use `generateServerClient` inside of `runWithAmplifyServerContext` with the `request` object.',
		});
	}

	const { runWithAmplifyServerContext, resourcesConfig } =
		createServerRunnerForAPI({ config });

	// This function reference gets passed down to InternalGraphQLAPI.ts.graphql
	// where this._graphql is passed in as the `fn` argument
	// causing it to always get invoked inside `runWithAmplifyServerContext`
	const getAmplify = (fn: (amplify: any) => Promise<any>) =>
		runWithAmplifyServerContext({
			nextServerContext: { cookies },
			operation: contextSpec =>
				fn(getAmplifyServerContext(contextSpec).amplify),
		});

	return internalGenerateClient<T, V6Client<T>>({
		amplify: getAmplify,
		config: resourcesConfig,
	});
}

/**
 * Generates an API client that can be used with both Pages Router and App Router
 *
 * @example
 * ```ts
 *
 * const client = generateServerClient()
 * 
 * result = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        return await client.graphql(contextSpec, {
          query: listPosts,
        })
      },
    })
 * ```
 */
export function generateServerClientUsingReqRes<
	T extends Record<any, any> = never
>({ config }: NextServer.CreateServerRunnerInput): V6ClientSSR<T> {
	const amplifyConfig = getAmplifyConfig(config);
	// passing `null` instance because each (future model) method must retrieve a valid instance
	// from server context
	const client = internalGenerateClient<T, V6ClientSSRRequest<T>>({
		amplify: null,
		config: amplifyConfig,
	});

	// TODO: improve this and the next type
	const prevGraphql = client.graphql as unknown as GraphQLMethod;

	const wrappedGraphql = (contextSpec, options, additionalHeaders?) => {
		const amplifyInstance = getAmplifyServerContext(contextSpec).amplify;
		return prevGraphql.call(
			{ [__amplify]: amplifyInstance },
			options,
			additionalHeaders as any
		);
	};

	client.graphql = wrappedGraphql as unknown as GraphQLMethodSSR;
	return client;
}
