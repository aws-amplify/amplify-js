// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { GraphQLQuery, GraphQLSubscription, SelectionSet } from './types';
export { generateClient } from './API';

export { GraphQLAuthError, ConnectionState } from '@aws-amplify/api-graphql';

export type {
	GraphQLResult,
	GraphQLReturnType,
	CONNECTION_STATE_CHANGE,
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
