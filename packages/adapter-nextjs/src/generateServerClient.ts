// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateClient as internalGenerateClient } from '@aws-amplify/api/server';
import {
	getAmplifyServerContext,
	AmplifyServerContextError,
} from '@aws-amplify/core/internals/adapter-core';
import {
	V6Client,
	V6ClientSSR,
	GraphQLMethod,
	GraphQLMethodSSR,
	__amplify,
} from '@aws-amplify/api-graphql';

import { runWithAmplifyServerContext } from './runWithAmplifyServerContext';
import { getAmplifyConfig } from './utils/getAmplifyConfig';
import { NextServer } from './types';

/**
 * Generates an API client that can be used inside a Next.js Server Component
 *
 * @example
 * ```ts
 * import { cookies } from "next/headers";
 *
 * const client = generateServerClientUsingCookies({ cookies })
 * client.graphql()
 * ```
 */
export function generateServerClientUsingCookies<
	T extends Record<any, any> = never
>(nextServerContext: NextServer.ServerComponentContext): V6Client<T> {
	if (
		!nextServerContext.cookies ||
		(nextServerContext as any).request !== undefined
	) {
		throw new AmplifyServerContextError({
			message:
				'generateServerClientUsingCookies is only compatible with the `cookies` Dynamic Function available in Server Components',
			// TODO: link to docs
			recoverySuggestion:
				'use generateServerClient inside of runWithAmplifyServerContext with the `request` object',
		});
	}

	// This function reference gets passed down to InternalGraphQLAPI.ts.graphql
	// where this._graphql is passed through as the `fn` argument
	// causing it to always get invoked inside `runWithAmplifyServerContext`
	const getAmplify = (fn: (amplify: any) => Promise<any>) =>
		runWithAmplifyServerContext({
			nextServerContext,
			operation: contextSpec =>
				fn(getAmplifyServerContext(contextSpec).amplify),
		});

	// retrieve general SSR config. This is used only to retrieve the
	// modelIntroSchema for future model-based use cases
	const config = getAmplifyConfig();

	return internalGenerateClient<T, V6Client<T>>({
		amplify: getAmplify,
		config,
	});
}

export function generateServerClient<
	T extends Record<any, any> = never
>(): V6ClientSSR<T> {
	const config = getAmplifyConfig();

	// passing `null` instance because each (future model) method must retrieve a valid instance
	// from server context
	const client = internalGenerateClient<T, V6ClientSSR<T>>({
		amplify: null,
		config,
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
