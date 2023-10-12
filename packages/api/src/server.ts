// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { GraphQLQuery, GraphQLSubscription } from './types';
import {
	graphql,
	cancel,
	isCancelError,
} from '@aws-amplify/api-graphql/internals';
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { __amplify, V6Client } from '@aws-amplify/api-graphql';

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
	return {
		[__amplify]: getAmplifyServerContext(contextSpec).amplify,
		graphql,
		cancel,
		isCancelError,
	};
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
