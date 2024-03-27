// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { GraphQLResult } from '../../../types';

export function isGraphQLResponseWithErrors(
	response: unknown,
): response is GraphQLResult {
	if (!response) {
		return false;
	}
	const r = response as GraphQLResult;

	return Array.isArray(r.errors) && r.errors.length > 0;
}
