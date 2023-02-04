// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { GraphQLAPI } from './GraphQLAPI';
export * from './types';
export { GraphQLAPI, GraphQLAPIClass, graphqlOperation } from './GraphQLAPI';
export { query, subscribe } from './commands';
export default GraphQLAPI;
