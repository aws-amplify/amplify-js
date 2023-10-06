// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(v6): revisit exports

export { GraphQLQuery, GraphQLSubscription } from './types';
export { generateClient } from './API';

export { GraphQLAuthError } from '@aws-amplify/api-graphql';

export type {
	GraphQLResult,
	GraphQLReturnType,
} from '@aws-amplify/api-graphql';

export {
	get,
	put,
	post,
	del,
	head,
	patch,
	isCancelError,
} from '@aws-amplify/api-rest';
