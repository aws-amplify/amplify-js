// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { GraphQLProviderConfig } from '@aws-amplify/core/internals/utils';

export function isApiGraphQLConfig(
	apiGraphQLConfig: GraphQLProviderConfig['GraphQL'] | undefined,
): apiGraphQLConfig is GraphQLProviderConfig['GraphQL'] {
	return apiGraphQLConfig !== undefined;
}
