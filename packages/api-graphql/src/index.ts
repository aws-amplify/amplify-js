// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { GraphQLAPI } from './GraphQLAPI';
export { GraphQLResult, GraphQLAuthError, GRAPHQL_AUTH_MODE } from './types';
export { GraphQLAPI, GraphQLAPIClass, graphqlOperation } from './GraphQLAPI';
export * from './types';
export * as DemoNoFlattening from './facade-no-flattening';
export * as DemoLightFlattening from './facade-light-flattening';
export * as DemoIterablePaging from './facade-iterable-paging';
export default GraphQLAPI;
