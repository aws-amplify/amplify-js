// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { graphql, cancel, isCancelError } from '..';
import { generateModelsProperty } from './generateModelsProperty';
import { Hub } from '@aws-amplify/core';
import {
	__amplify,
	__authMode,
	__authToken,
	__headers,
	V6ClientSSRRequest,
	V6ClientSSRCookies,
	ServerClientGenerationParams,
	CommonPublicClientOptions,
} from '../../types';
import { isApiGraphQLConfig } from '../utils/isApiGraphQLProviderConfig';
import { generateEnumsProperty } from '../utils/generateEnumsProperty';
import {
	generateCustomMutationsProperty,
	generateCustomQueriesProperty,
} from '../generateCustomOperationsProperty';

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
		| V6ClientSSRRequest<T>
		| V6ClientSSRCookies<T> = V6ClientSSRCookies<T>,
>(
	params: ServerClientGenerationParams & CommonPublicClientOptions,
): ClientType {
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
		client.models = generateModelsProperty<T>(client, params);
		client.enums = generateEnumsProperty<T>(apiGraphqlConfig);
		client.queries = generateCustomQueriesProperty<T>(client, apiGraphqlConfig);
		client.mutations = generateCustomMutationsProperty<T>(
			client,
			apiGraphqlConfig,
		);
	}

	return client as ClientType;
}
