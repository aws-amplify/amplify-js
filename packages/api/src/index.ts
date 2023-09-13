// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { GraphQLQuery, GraphQLSubscription } from './types';
import { API } from './API';

export type { GraphQLResult } from '@aws-amplify/api-graphql';

const generateClient = API.generateClient;

export { generateClient };
