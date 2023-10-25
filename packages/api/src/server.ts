// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { GraphQLQuery, GraphQLSubscription } from './types';
import { generateClient as internalGenerateClient } from '@aws-amplify/api-graphql/internals/server';
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { V6Client, __amplify } from '@aws-amplify/api-graphql';

export type {
	GraphQLResult,
	GraphQLReturnType,
} from '@aws-amplify/api-graphql';

/**
 * Generates an API client that can work with models or raw GraphQL
 */
export function generateClient<T extends Record<any, any> = never>(
	contextSpec: AmplifyServer.ContextSpec
): V6Client<T> {
	return internalGenerateClient({
		amplify: getAmplifyServerContext(contextSpec).amplify,
	});
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
