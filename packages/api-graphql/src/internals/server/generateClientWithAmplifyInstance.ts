// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { addSchemaToClientWithInstance } from '@aws-amplify/data-schema/runtime';

import {
	CommonPublicClientOptions,
	ServerClientGenerationParams,
	V6ClientSSRCookies,
	V6ClientSSRRequest,
	__amplify,
	__apiKey,
	__authMode,
	__authToken,
	__endpoint,
	__headers,
	getInternals,
} from '../../types';
import { isApiGraphQLConfig } from '../utils/runtimeTypeGuards/isApiGraphQLProviderConfig';
import { cancel, graphql, isCancelError } from '..';

/**
 * @private
 *
 * Used internally by `adapter-nextjs` package.
 *
 * Creates a client that can be used to make GraphQL requests, using a provided `AmplifyClassV6`
 * compatible context object for config and auth fetching.
 *
 * @param params
 * @returns
 */
export function generateClientWithAmplifyInstance<
	T extends Record<any, any> = never,
	WithCustomEndpoint extends boolean = false,
	WithApiKey extends boolean = false,
	ClientType extends
		| V6ClientSSRRequest<T, WithCustomEndpoint, WithApiKey>
		| V6ClientSSRCookies<
				T,
				WithCustomEndpoint,
				WithApiKey
		  > = V6ClientSSRCookies<T, WithCustomEndpoint, WithApiKey>,
>(
	params: ServerClientGenerationParams &
		CommonPublicClientOptions<WithCustomEndpoint, WithApiKey>,
): ClientType {
	const client = {
		[__amplify]: params.amplify,
		[__authMode]: params.authMode,
		[__authToken]: params.authToken,
		[__apiKey]: 'apiKey' in params ? params.apiKey : undefined,
		[__endpoint]: 'endpoint' in params ? params.endpoint : undefined,
		[__headers]: params.headers,
		graphql,
		cancel,
		isCancelError,
	} as any;

	const apiGraphqlConfig = params.config?.API?.GraphQL;

	if (!client[__endpoint] && isApiGraphQLConfig(apiGraphqlConfig)) {
		addSchemaToClientWithInstance<T>(client, params, getInternals);
	}

	return client as any;
}
