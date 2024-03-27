// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { GraphQLError } from 'graphql';

import { GraphQLResult } from '../../types';

export const createGraphQLResultWithError = <T>(
	error: Error,
): GraphQLResult<T> => {
	return {
		data: {} as T,
		errors: [new GraphQLError(error.message, null, null, null, null, error)],
	};
};
