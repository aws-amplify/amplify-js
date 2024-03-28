// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// import { GraphQLFormattedError } from '@aws-amplify/data-schema-types';

/**
 * Handle errors for list and index query operations
 */
export function handleListGraphQlError(error: any) {
	if (error?.errors) {
		// graphql errors pass through
		return {
			...error,
			data: [],
		} as any;
	} else {
		// non-graphql errors re re-thrown
		throw error;
	}
}

/**
 * Handle errors for singular operations (create, get, update, delete)
 */
export function handleSingularGraphQlError(error: any) {
	if (error.errors) {
		// graphql errors pass through
		return {
			...error,
			data: null,
		} as any;
	} else {
		// non-graphql errors re re-thrown
		throw error;
	}
}
