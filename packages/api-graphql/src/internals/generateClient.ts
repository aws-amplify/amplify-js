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
import { Hub, ResourcesConfig } from '@aws-amplify/core';

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
		const { event, data } = coreEvent.payload;

		if (event !== 'configure') {
			return;
		}

		// data is guaranteed to be `ResourcesConfig` when the event is `configure`
		const resourceConfig = data as ResourcesConfig;

		if (resourceConfig.API?.GraphQL) {
			clientRef.models = generateModelsProperty<T>(
				clientRef,
				resourceConfig.API?.GraphQL,
			);
		}
	});
};

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
