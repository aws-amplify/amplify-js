// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CommonPublicClientOptions,
	DefaultCommonClientOptions,
	V6ClientSSRCookies,
	V6ClientSSRRequest,
	generateClientWithAmplifyInstance,
} from 'aws-amplify/api/internals';
import { generateClient } from 'aws-amplify/api/server';
import {
	AmplifyServerContextError,
	getAmplifyServerContext,
} from 'aws-amplify/adapter-core/internals';
import { parseAmplifyConfig } from 'aws-amplify/utils';

import { NextServer } from '../types';

import { createServerRunnerForAPI } from './createServerRunnerForAPI';

interface CookiesClientParams {
	cookies: NextServer.ServerComponentContext['cookies'];
	config: NextServer.CreateServerRunnerInput['config'];
}

interface ReqClientParams {
	config: NextServer.CreateServerRunnerInput['config'];
}

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
	T extends Record<any, any> = never,
	Options extends CommonPublicClientOptions &
		CookiesClientParams = DefaultCommonClientOptions & CookiesClientParams,
>(options: Options): V6ClientSSRCookies<T, Options> {
	if (typeof options.cookies !== 'function') {
		throw new AmplifyServerContextError({
			message:
				'generateServerClientUsingCookies is only compatible with the `cookies` Dynamic Function available in Server Components.',
			// TODO: link to docs
			recoverySuggestion:
				'use `generateServerClient` inside of `runWithAmplifyServerContext` with the `request` object.',
		});
	}

	const { runWithAmplifyServerContext, resourcesConfig } =
		createServerRunnerForAPI({ config: options.config });

	// This function reference gets passed down to InternalGraphQLAPI.ts.graphql
	// where this._graphql is passed in as the `fn` argument
	// causing it to always get invoked inside `runWithAmplifyServerContext`
	const getAmplify = (fn: (amplify: any) => Promise<any>) =>
		runWithAmplifyServerContext({
			nextServerContext: { cookies: options.cookies },
			operation: contextSpec =>
				fn(getAmplifyServerContext(contextSpec).amplify),
		});

	const { cookies: _cookies, config: _config, ...params } = options;

	return generateClientWithAmplifyInstance<T, V6ClientSSRCookies<T, Options>>({
		amplify: getAmplify,
		config: resourcesConfig,
		...params,
	} as any); // TS can't narrow the type here.
}

/**
 * Generates an API client that can be used with both Pages Router and App Router
 *
 * @example
 * import config from './amplifyconfiguration.json';
 * import { listPosts } from './graphql/queries';
 *
 * const client = generateServerClientUsingReqRes({ config });
 *
 * const result = await runWithAmplifyServerContext({
 *   nextServerContext: { request, response },
 *   operation: (contextSpec) => client.graphql(contextSpec, {
 *     query: listPosts,
 *   }),
 * });
 */
export function generateServerClientUsingReqRes<
	T extends Record<any, any> = never,
	Options extends CommonPublicClientOptions &
		ReqClientParams = DefaultCommonClientOptions & ReqClientParams,
>(options: Options): V6ClientSSRRequest<T, Options> {
	const amplifyConfig = parseAmplifyConfig(options.config);

	const { config: _config, ...params } = options;

	return generateClient<T>({
		config: amplifyConfig,
		...params,
	}) as any;
}
