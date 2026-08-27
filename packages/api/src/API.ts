// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { V6Client } from '@aws-amplify/api-graphql';
import {
	CommonPublicClientOptions,
	DefaultCommonClientOptions,
	generateClient as internalGenerateClient,
} from '@aws-amplify/api-graphql/internals';
import { Amplify, AmplifyContext, isAmplifyContext } from '@aws-amplify/core';

/**
 * Generates an API client that can work with models or raw GraphQL
 *
 * @returns {@link V6Client}
 * @throws {@link Error} - Throws error when client cannot be generated due to configuration issues.
 */
export function generateClient<
	T extends Record<any, any> = never,
	Options extends CommonPublicClientOptions = DefaultCommonClientOptions,
>(options?: Options): V6Client<T, Options>;

/**
 * Generates an API client bound to a specific {@link AmplifyContext} instead of
 * the global `Amplify` singleton. Use this overload when you need to scope a
 * client to an explicit context (e.g. multi-tenant or server-side rendering
 * scenarios) rather than the shared singleton configuration.
 *
 * @param ctx - The {@link AmplifyContext} the client should resolve its
 * configuration and auth from.
 * @param options - Optional client options.
 * @returns {@link V6Client}
 * @throws {@link Error} - Throws error when client cannot be generated due to configuration issues.
 *
 * @example
 * ```ts
 * import { generateClient } from 'aws-amplify/api';
 * // `listTodos` is a generated GraphQL query document (from your API's codegen output).
 *
 * const client = generateClient(ctx);
 * const result = await client.graphql({ query: listTodos });
 * ```
 */
export function generateClient<
	T extends Record<any, any> = never,
	Options extends CommonPublicClientOptions = DefaultCommonClientOptions,
>(ctx: AmplifyContext, options?: Options): V6Client<T, Options>;

export function generateClient<
	T extends Record<any, any> = never,
	Options extends CommonPublicClientOptions = DefaultCommonClientOptions,
>(
	ctxOrOptions?: AmplifyContext | Options,
	maybeOptions?: Options,
): V6Client<T, Options> {
	// When the first argument is a branded AmplifyContext, bind the client to it
	// and treat the second argument as the options. Otherwise fall back to the
	// global `Amplify` singleton and treat the first argument as the options.
	// `isAmplifyContext` is inlined in each ternary so its type guard narrows
	// `ctxOrOptions` in place.
	const amplify = isAmplifyContext(ctxOrOptions) ? ctxOrOptions : Amplify;
	const options = isAmplifyContext(ctxOrOptions) ? maybeOptions : ctxOrOptions;

	return internalGenerateClient({
		...(options ?? {}),
		amplify,
	}) as unknown as V6Client<T, Options>;
}
