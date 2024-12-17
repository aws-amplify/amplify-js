// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateClientWithAmplifyInstance } from '@aws-amplify/api/internals';
import { generateClient } from 'aws-amplify/api/server';
import {
	AmplifyServerContextError,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import {
	CommonPublicClientOptions,
	V6ClientSSRCookies,
	V6ClientSSRRequest,
} from '@aws-amplify/api-graphql';
import { parseAmplifyConfig } from '@aws-amplify/core/internals/utils';

import { NextServer } from '../types';

import { createServerRunnerForAPI } from './createServerRunnerForAPI';

type CookiesClientParams<
	WithEndpoint extends boolean,
	WithApiKey extends boolean,
> = {
	cookies: NextServer.ServerComponentContext['cookies'];
	config: NextServer.CreateServerRunnerInput['config'];
} & CommonPublicClientOptions<WithEndpoint, WithApiKey>;

type ReqClientParams<
	WithEndpoint extends boolean,
	WithApiKey extends boolean,
> = {
	config: NextServer.CreateServerRunnerInput['config'];
} & CommonPublicClientOptions<WithEndpoint, WithApiKey>;

// NOTE: The type narrowing on CommonPublicClientOptions seems to hinge on
// defining these signatures separately. Not sure why offhand. This is worth
// some investigation later.

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
>(
	options: CookiesClientParams<false, false>,
): V6ClientSSRCookies<T, false, false>;
export function generateServerClientUsingCookies<
	T extends Record<any, any> = never,
>(
	options: CookiesClientParams<false, true>,
): V6ClientSSRCookies<T, false, true>;
export function generateServerClientUsingCookies<
	T extends Record<any, any> = never,
>(
	options: CookiesClientParams<true, false>,
): V6ClientSSRCookies<T, true, false>;
export function generateServerClientUsingCookies<
	T extends Record<any, any> = never,
>(options: CookiesClientParams<true, true>): V6ClientSSRCookies<T, true, true>;
export function generateServerClientUsingCookies<
	T extends Record<any, any> = never,
	WithCustomEndpoint extends boolean = false,
	WithApiKey extends boolean = false,
>(
	options: CookiesClientParams<WithCustomEndpoint, WithApiKey>,
): V6ClientSSRCookies<T, WithCustomEndpoint, WithApiKey> {
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

	return generateClientWithAmplifyInstance<
		T,
		WithCustomEndpoint,
		WithApiKey,
		V6ClientSSRCookies<T, WithCustomEndpoint, WithApiKey>
	>({
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
>(options: ReqClientParams<false, false>): V6ClientSSRRequest<T, false, false>;
export function generateServerClientUsingReqRes<
	T extends Record<any, any> = never,
>(options: ReqClientParams<false, true>): V6ClientSSRRequest<T, false, true>;
export function generateServerClientUsingReqRes<
	T extends Record<any, any> = never,
>(options: ReqClientParams<true, false>): V6ClientSSRRequest<T, true, false>;
export function generateServerClientUsingReqRes<
	T extends Record<any, any> = never,
>(options: ReqClientParams<true, true>): V6ClientSSRRequest<T, true, true>;
export function generateServerClientUsingReqRes<
	T extends Record<any, any> = never,
	WithCustomEndpoint extends boolean = false,
	WithApiKey extends boolean = false,
>(
	options: ReqClientParams<WithCustomEndpoint, WithApiKey>,
): V6ClientSSRRequest<T, WithCustomEndpoint, WithApiKey> {
	const amplifyConfig = parseAmplifyConfig(options.config);

	const { config: _config, ...params } = options;

	return generateClient<T, WithCustomEndpoint, WithApiKey>({
		config: amplifyConfig,
		...params,
	} as any); // TS can't narrow the type here.
}
