// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ServerClientGenerationParams,
	V6Client,
	V6ClientSSR,
	__amplify,
} from '@aws-amplify/api-graphql';
import {
	graphql,
	cancel,
	isCancelError,
} from '@aws-amplify/api-graphql/internals';

/**
 * @private
 *
 * Creates a client that can be used to make GraphQL requests, using a provided `AmplifyClassV6`
 * compatible context object for config and auth fetching.
 *
 * @param params
 * @returns
 */
export function generateServerClient<
	T extends Record<any, any> = never,
	ClientType extends V6ClientSSR<T> | V6Client<T> = V6ClientSSR<T>
>(params: ServerClientGenerationParams): ClientType {
	const client = {
		[__amplify]: params.amplify,
		graphql,
		cancel,
		isCancelError,
		models: {},
	} as any;

	return client as ClientType;
}
