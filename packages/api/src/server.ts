// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { GraphQLQuery, GraphQLSubscription } from './types';
import {
	graphql,
	cancel,
	isCancelError,
} from '@aws-amplify/api-graphql/internals';

import {
	__amplify,
	__authMode,
	__authToken,
	V6ClientSSRRequest,
	V6ClientSSRCookies,
	ServerClientGenerationParams,
	CommonPublicClientOptions,
} from '@aws-amplify/api-graphql';

import { generateModelsProperty } from '@aws-amplify/api-graphql/internals/server';

export type {
	GraphQLResult,
	GraphQLReturnType,
} from '@aws-amplify/api-graphql';

/**
 * @private
 *
 * Creates a client that can be used to make GraphQL requests, using a provided `AmplifyClassV6`
 * compatible context object for config and auth fetching.
 *
 * @param params
 * @returns
 */
export function generateClient<
	T extends Record<any, any> = never,
	ClientType extends
		| V6ClientSSRRequest<T>
		| V6ClientSSRCookies<T> = V6ClientSSRCookies<T>
>(
	params: ServerClientGenerationParams & CommonPublicClientOptions
): ClientType {
	const client = {
		[__amplify]: params.amplify,
		[__authMode]: params.authMode,
		[__authToken]: params.authToken,
		graphql,
		cancel,
		isCancelError,
	} as any;

	client.models = generateModelsProperty(client, params);

	return client as ClientType;
}

export {
	get,
	put,
	post,
	del,
	head,
	patch,
	isCancelError,
} from '@aws-amplify/api-rest/server';
