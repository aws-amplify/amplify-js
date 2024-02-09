// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { graphql, cancel, isCancelError } from './v6';
import { generateModelsProperty } from './generateModelsProperty';
import {
	V6Client,
	__amplify,
	__authMode,
	__authToken,
	__headers,
} from '../types';
import { ClientGenerationParams } from './types';
import { ModelTypes } from '@aws-amplify/data-schema-types';
import { Hub, HubCapsule, ResourcesConfig } from '@aws-amplify/core';

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
	params: ClientGenerationParams
): V6Client<T> {
	const client = {
		[__amplify]: params.amplify,
		[__authMode]: params.authMode,
		[__authToken]: params.authToken,
		[__headers]: params.headers,
		graphql,
		cancel,
		isCancelError,
		models: {},
	} as any;

	const config = params.amplify.getConfig();

	if (!config.API?.GraphQL) {
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
		client.models = emptyModels as ModelTypes<never>;
		generateModelsPropertyOnAmplifyConfigure<T>(client);
	} else {
		client.models = generateModelsProperty<T>(
			client,
			config.API?.GraphQL,
		);
	}

	return client as V6Client<T>;
}

const generateModelsPropertyOnAmplifyConfigure = <
	T extends Record<any, any> = never,
>(clientRef: any) => {
	Hub.listen('core', coreEvent => {
		if (!isConfigureEvent(coreEvent.payload)) {
			return;
		}

		const { data: resourceConfig } = coreEvent.payload;

		if (resourceConfig.API?.GraphQL) {
			clientRef.models = generateModelsProperty<T>(
				clientRef,
				resourceConfig.API?.GraphQL,
			);
		}
	});
};

function isConfigureEvent(
	payload: HubCapsule<'core', { event: string; data?: unknown }>['payload'],
): payload is {
	event: 'configure';
	data: ResourcesConfig;
} {
	return payload.event === 'configure';
}

const emptyModels = new Proxy(
	{},
	{
		get() {
			throw new Error(
				'Could not generate client. This is likely due to Amplify.configure() not being called prior to generateClient().',
			);
		},
	},
);
