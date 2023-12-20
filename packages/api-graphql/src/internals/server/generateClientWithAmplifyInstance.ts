// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { graphql, cancel, isCancelError } from '..';
import { generateModelsProperty } from './generateModelsProperty';
import {
	__amplify,
	__authMode,
	__authToken,
	V6ClientSSRRequest,
	V6ClientSSRCookies,
	ServerClientGenerationParams,
	CommonPublicClientOptions,
} from '../../types';

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

	client.models = generateModelsProperty<T>(client, params);

	return client as ClientType;
}
