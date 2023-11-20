// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateServerClient } from '@aws-amplify/api/internals';
import {
	getAmplifyServerContext,
	AmplifyServerContextError,
	AmplifyServer,
} from '@aws-amplify/core/internals/adapter-core';
import {
	V6ClientSSRRequest,
	V6ClientSSRCookies,
	GraphQLMethod,
	GraphQLMethodSSR,
	__amplify,
	GraphQLOptionsV6,
} from '@aws-amplify/api-graphql';
import { NextServer } from '../types';
import { createServerRunnerForAPI } from './createServerRunnerForAPI';
import { getAmplifyConfig } from '../utils';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';
import { CustomHeaders } from '@aws-amplify/data-schema-types';

type CookiesClientParams = {
	cookies: NextServer.ServerComponentContext['cookies'];
	config: NextServer.CreateServerRunnerInput['config'];
	authMode?: GraphQLAuthMode;
	authToken?: string;
};

type ReqClientParams = {
	config: NextServer.CreateServerRunnerInput['config'];
	authMode?: GraphQLAuthMode;
	authToken?: string;
};

/**
 * Generates an API client that can be used inside a Next.js Server Component with Dynamic Rendering
 *
 * @example
 * import { cookies } from "next/headers"
 *
 * const client = generateServerClientUsingCookies({ cookies });
 * const result = await client.graphql({ query: listPosts });
 */
export function generateServerClientUsingCookies<
	T extends Record<any, any> = never
>({
	config,
	cookies,
	authMode,
	authToken,
}: CookiesClientParams): V6ClientSSRCookies<T> {
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

	return generateServerClient<T, V6ClientSSRCookies<T>>({
		amplify: getAmplify,
		config: resourcesConfig,
		authMode,
		authToken,
	});
}

/**
 * Generates an API client that can be used with both Pages Router and App Router
 *
 * @example
 * import config from './amplifyconfiguration.json';
 * import { listPosts } from './graphql/queries';
 *
 * const client = generateServerClientUsingReqRes();
 *
 * result = await runWithAmplifyServerContext({
 *   nextServerContext: { request, response },
 *   operation: (contextSpec) => client.graphql(contextSpec, {
 *     query: listPosts,
 *   }),
 * });
 */
export function generateServerClientUsingReqRes<
	T extends Record<any, any> = never
>({ config, authMode, authToken }: ReqClientParams): V6ClientSSRRequest<T> {
	const amplifyConfig = getAmplifyConfig(config);
	// passing `null` instance because each (future model) method must retrieve a valid instance
	// from server context
	const client = generateServerClient<T, V6ClientSSRRequest<T>>({
		amplify: null,
		config: amplifyConfig,
		authMode,
		authToken,
	});

	// TODO: improve this and the next type
	const prevGraphql = client.graphql as unknown as GraphQLMethod;

	const wrappedGraphql = (
		contextSpec: AmplifyServer.ContextSpec,
		options: GraphQLOptionsV6,
		additionalHeaders?: CustomHeaders
	) => {
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
