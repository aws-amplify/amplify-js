// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateClient as internalGenerateClient } from '@aws-amplify/api-graphql/internals/server';
import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { V6Client, __amplify } from '@aws-amplify/api-graphql';

import { runWithAmplifyServerContext } from './runWithAmplifyServerContext';
import { getAmplifyConfig } from './utils/getAmplifyConfig';
import { NextServer } from './types';

/**
 *
 *
 *
 * TODO: create a server-side version of generateModelsProperty.ts
 * Duplicate code for now, but we'll be able to extract and abstract
 * most of the implementation during the refactor
 *
 *
 *
 */

export type {
	GraphQLResult,
	GraphQLReturnType,
} from '@aws-amplify/api-graphql';

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
		throw new Error(
			'generateServerClientUsingCookies is only compatible with the `cookies` Dynamic Function available in Server Components'
		);
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

	// retrieve general SSR config. This is used only for get the
	// modelIntroSchema in generateModelsProperty
	const config = getAmplifyConfig();

	return internalGenerateClient({ amplify: getAmplify, config });
}

export function generateServerClient<
	T extends Record<any, any> = never
>(): V6Client<T> {
	const config = getAmplifyConfig();

	// passing `null` instance because each method must retrieve a valid instance
	// from server context
	const client = internalGenerateClient({ amplify: null, config });

	const wrappedGraphql = (contextSpec, options, additionalHeaders?) => {
		const amplifyInstance = getAmplifyServerContext(contextSpec).amplify;
		return client.graphql(amplifyInstance, options, additionalHeaders);
	};

	client.graphql = wrappedGraphql;
}
