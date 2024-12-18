// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { V6Client } from '@aws-amplify/api-graphql';
import {
	CommonPublicClientOptions,
	generateClient as internalGenerateClient,
} from '@aws-amplify/api-graphql/internals';
import { Amplify } from '@aws-amplify/core';

// NOTE: The type narrowing on CommonPublicClientOptions seems to hinge on
// defining these signatures separately. Not sure why offhand. This is worth
// some investigation later.

/**
 * Generates an API client that can work with models or raw GraphQL
 *
 * @returns {@link V6Client}
 * @throws {@link Error} - Throws error when client cannot be generated due to configuration issues.
 */
export function generateClient<
	T extends Record<any, any> = never,
	Options extends CommonPublicClientOptions = object,
>(options?: Options): V6Client<T, Options> {
	return internalGenerateClient({
		...(options || ({} as any)),
		amplify: Amplify,
	}) as unknown as V6Client<T, Options>;
}
