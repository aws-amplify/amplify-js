// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(v6): revisit exports

export { GraphQLQuery, GraphQLSubscription } from './types';
import { API, APIClass } from './API';
export {
	graphqlOperation,
	GraphQLAuthError,
	GraphQLAuthMode,
} from '@aws-amplify/api-graphql';

export type { GraphQLResult } from '@aws-amplify/api-graphql';

const generateClient = API.generateClient;

export { API, APIClass, generateClient };
