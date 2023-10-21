// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateClient as internalGenerateClient } from '@aws-amplify/api-graphql/internals';
import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { V6Client } from '@aws-amplify/api-graphql';

import { runWithAmplifyServerContext } from './runWithAmplifyServerContext';
import { getAmplifyConfig } from './utils/getAmplifyConfig';
import { NextServer } from './types';

export type {
	GraphQLResult,
	GraphQLReturnType,
} from '@aws-amplify/api-graphql';

/**
 * Generates an API client that can work with models or raw GraphQL
 */
export function generateServerClient<T extends Record<any, any> = never>(
	nextServerContext: NextServer.Context
): V6Client<T> {
	// This function reference gets passed down to InternalGraphQLAPI.graphql
	// where this._graphql is passed through as the `fn` argument
	// causing it to always get invoked inside `runWithAmplifyServerContext`
	const getAmplify = (fn: (amplify: any) => Promise<any>) =>
		runWithAmplifyServerContext({
			nextServerContext,
			operation: contextSpec =>
				fn(getAmplifyServerContext(contextSpec).amplify),
		});

	// retrieve general SSR config. This is used only for get the
	// modelIntroSchema in generateModelsProperty
	const config = getAmplifyConfig();

	return internalGenerateClient({ amplify: getAmplify, config });
}
