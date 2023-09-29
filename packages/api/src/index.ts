// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(v6): revisit exports

import { API } from './API';

// Used by Datastore
export { GraphQLAuthError } from '@aws-amplify/api-graphql';

// Used by DataStore
export type { GraphQLResult } from '@aws-amplify/api-graphql';

const generateClient = API.generateClient;

export { generateClient };
