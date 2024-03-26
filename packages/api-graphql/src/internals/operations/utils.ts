// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function handleGraphQlError(error: any) {
	if (error.errors) {
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
