// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Hub } from '@aws-amplify/core';
import { graphql, cancel, isCancelError } from './v6';
import {
	EnumTypes,
	ModelTypes,
	CustomQueries,
	CustomMutations,
} from '@aws-amplify/data-schema-types';
import { generateEnumsProperty } from './utils/generateEnumsProperty';
import { generateModelsProperty } from './utils/generateModelsProperty';
import { isApiGraphQLConfig } from './utils/isApiGraphQLProviderConfig';
import {
	generateCustomQueriesProperty,
	generateCustomMutationsProperty,
} from './generateCustomOperationsProperty';
import {
	V6Client,
	__amplify,
	__authMode,
	__authToken,
	__headers,
} from '../types';
import { ClientGenerationParams } from './types';
import { isConfigureEventWithResourceConfig } from './utils/isConfigureEventWithResourceConfig';

/**
 * @private
 *
 * Creates a client that can be used to make GraphQL requests, using a provided `AmplifyClassV6`
 * compatible context object for config and auth fetching.
 *
 * @param params
 * @returns
 */
export function generateClient<T extends Record<any, any> = never>(
	params: ClientGenerationParams,
): V6Client<T> {
	const client = {
		[__amplify]: params.amplify,
		[__authMode]: params.authMode,
		[__authToken]: params.authToken,
		[__headers]: params.headers,
		graphql,
		cancel,
		isCancelError,
		models: emptyProperty as ModelTypes<never>,
		enums: emptyProperty as EnumTypes<never>,
		queries: emptyProperty as CustomQueries<never>,
		mutations: emptyProperty as CustomMutations<never>,
	} as any;

	const apiGraphqlConfig = params.amplify.getConfig().API?.GraphQL;

	if (isApiGraphQLConfig(apiGraphqlConfig)) {
		client.models = generateModelsProperty<T>(client, apiGraphqlConfig);
		client.enums = generateEnumsProperty<T>(apiGraphqlConfig);
		client.queries = generateCustomQueriesProperty<T>(client, apiGraphqlConfig);
		client.mutations = generateCustomMutationsProperty<T>(
			client,
			apiGraphqlConfig,
		);
	} else {
		// This happens when the `Amplify.configure()` call gets evaluated after the `generateClient()` call.
		//
		// Cause: when the `generateClient()` and the `Amplify.configure()` calls are located in
		// different source files, script bundlers may randomly arrange their orders in the production
		// bundle.
		//
		// With the current implementation, the `client.models` instance created by `generateClient()`
		// will be rebuilt on every `Amplify.configure()` call that's provided with a valid GraphQL
		// provider configuration.
		//
		// TODO: revisit, and reverify this approach when enabling multiple clients for multi-endpoints
		// configuration.
		generateModelsPropertyOnAmplifyConfigure(client);
	}

	return client as V6Client<T>;
}

const generateModelsPropertyOnAmplifyConfigure = (clientRef: any) => {
	Hub.listen('core', coreEvent => {
		if (!isConfigureEventWithResourceConfig(coreEvent.payload)) {
			return;
		}

		const apiGraphQLConfig = coreEvent.payload.data.API?.GraphQL;

		if (isApiGraphQLConfig(apiGraphQLConfig)) {
			clientRef.models = generateModelsProperty(clientRef, apiGraphQLConfig);
			clientRef.enums = generateEnumsProperty(apiGraphQLConfig);
			clientRef.queries = generateCustomQueriesProperty(
				clientRef,
				apiGraphQLConfig,
			);
			clientRef.mutations = generateCustomMutationsProperty(
				clientRef,
				apiGraphQLConfig,
			);
		}
	});
};

const emptyProperty = new Proxy(
	{},
	{
		get() {
			throw new Error(
				'Client could not be generated. This is likely due to `Amplify.configure()` not being called prior to `generateClient()` or because the configuration passed to `Amplify.configure()` is missing GraphQL provider configuration.',
			);
		},
	},
);
