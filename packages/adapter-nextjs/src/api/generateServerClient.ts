// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CommonPublicClientOptions,
	DefaultCommonClientOptions,
	V6Client,
	V6ClientSSRCookies,
	generateClient,
} from 'aws-amplify/api/internals';
import { AmplifyServerContextError } from 'aws-amplify/adapter-core/internals';
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
			recoverySuggestion:
				'use `generateServerClient` inside of `runWithAmplifyServerContext` with the `request` object.',
		});
	}

	const { resourcesConfig } = createServerRunnerForAPI({
		config: options.config,
	});

	const { cookies: _cookies, config: _config, ...params } = options;

	return generateClient<T>({
		config: resourcesConfig,
		...params,
	} as any) as any;
}

/**
 * Generates an API client that can be used with both Pages Router and App Router.
 * Create the client inside `runWithAmplifyServerContext` where the `AmplifyContext` is available.
 *
 * @example
 * const client = generateServerClientUsingReqRes({ config });
 *
 * const result = await runWithAmplifyServerContext({
 *   nextServerContext: { request, response },
 *   operation: (ctx) => client.graphql({ query: listPosts }),
 * });
 */
export function generateServerClientUsingReqRes<
	T extends Record<any, any> = never,
	Options extends CommonPublicClientOptions &
		ReqClientParams = DefaultCommonClientOptions & ReqClientParams,
>(options: Options): V6Client<T, Options> {
	const amplifyConfig = parseAmplifyConfig(options.config);

	const { config: _config, ...params } = options;

	return generateClient<T>({
		config: amplifyConfig,
		...params,
	} as any) as any;
}
