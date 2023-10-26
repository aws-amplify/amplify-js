// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { GraphQLQuery, GraphQLSubscription } from './types';
import {
	graphql,
	cancel,
	isCancelError,
} from '@aws-amplify/api-graphql/internals';
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	__amplify,
	V6Client,
	V6ClientSSR,
	ServerClientGenerationParams,
} from '@aws-amplify/api-graphql';

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

export {
	get,
	put,
	post,
	del,
	head,
	patch,
	isCancelError,
} from '@aws-amplify/api-rest/server';
