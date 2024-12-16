// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CommonPublicClientOptions, V6Client } from '@aws-amplify/api-graphql';
import { generateClient as internalGenerateClient } from '@aws-amplify/api-graphql/internals';
import { Amplify } from '@aws-amplify/core';

/**
 * Generates an API client that can work with models or raw GraphQL
 *
 * @returns {@link V6Client}
 * @throws {@link Error} - Throws error when client cannot be generated due to configuration issues.
 */
export function generateClient<T extends Record<any, any> = never>(
	options?: CommonPublicClientOptions<false, false>,
): V6Client<T, false, false>;
export function generateClient<T extends Record<any, any> = never>(
	options?: CommonPublicClientOptions<false, true>,
): V6Client<T, false, true>;
export function generateClient<T extends Record<any, any> = never>(
	options?: CommonPublicClientOptions<true, false>,
): V6Client<T, true, false>;
export function generateClient<T extends Record<any, any> = never>(
	options?: CommonPublicClientOptions<true, true>,
): V6Client<T, true, true>;
export function generateClient<
	WithCustomEndpoint extends boolean,
	WithApiKey extends boolean,
	T extends Record<any, any> = never,
>(
	options?: CommonPublicClientOptions<WithCustomEndpoint, WithApiKey>,
): V6Client<T, WithCustomEndpoint, WithApiKey> {
	return internalGenerateClient({
		...(options || ({} as any)),
		amplify: Amplify,
	}) as unknown as V6Client<T, WithCustomEndpoint, WithApiKey>;
}
