// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ClientExtensionsSSRCookies,
	ClientExtensionsSSRRequest,
	addSchemaToClientWithInstance,
} from '@aws-amplify/data-schema';

import {
	CommonPublicClientOptions,
	ServerClientGenerationParams,
	V6ClientSSRCookies,
	V6ClientSSRRequest,
	__amplify,
	__authMode,
	__authToken,
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
	ClientType extends
		| V6ClientSSRRequest
		| V6ClientSSRCookies = V6ClientSSRCookies,
>(
	params: ServerClientGenerationParams & CommonPublicClientOptions,
): ClientType extends V6ClientSSRRequest
	? ClientType & ClientExtensionsSSRRequest<T>
	: ClientType & ClientExtensionsSSRCookies<T> {
	const client = {
		[__amplify]: params.amplify,
		[__authMode]: params.authMode,
		[__authToken]: params.authToken,
		[__headers]: params.headers,
		graphql,
		cancel,
		isCancelError,
	} as any;

	const apiGraphqlConfig = params.config?.API?.GraphQL;

	if (isApiGraphQLConfig(apiGraphqlConfig)) {
		addSchemaToClientWithInstance<T>(client, params, getInternals);
	}

	return client as any;
}
