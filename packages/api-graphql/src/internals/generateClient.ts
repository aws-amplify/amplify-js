// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { graphql, cancel, isCancelError } from './v6';
import { generateModelsProperty } from './generateModelsProperty';
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
import { generateQueriesProperty } from './generateQueriesProperty';

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
		queries: {},
		mutations: {},
	} as any;

	client.models = generateModelsProperty<T>(client, params);
	client.queries = generateCustomQueriesProperty<T>(client, params);
	client.mutations = generateCustomMutationsProperty<T>(client, params);

	return client as V6Client<T>;
}
