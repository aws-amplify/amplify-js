// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { V6Client } from '@aws-amplify/api-graphql';

export { GraphQLQuery, GraphQLSubscription, SelectionSet } from './types';
export { generateClient } from './API';

export { GraphQLAuthError, ConnectionState } from '@aws-amplify/api-graphql';

export type {
	GraphQLResult,
	GraphQLReturnType,
} from '@aws-amplify/api-graphql';

export { CONNECTION_STATE_CHANGE } from '@aws-amplify/api-graphql';

// explicitly defaulting to `never` here resolves
// TS2589: Type instantiation is excessively deep and possibly infinite.
// When this type is used without a generic type arg, i.e. `let client: Client`
type Client<T extends Record<any, any> = never> = V6Client<T>;
export { Client };

export {
	get,
	put,
	post,
	del,
	head,
	patch,
	isCancelError,
} from '@aws-amplify/api-rest';

export { ApiError } from '@aws-amplify/core/internals/utils';
