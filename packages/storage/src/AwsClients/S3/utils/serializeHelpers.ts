// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @internal
 */
export const assignStringVariables = (
	values: Record<string, { toString: () => string } | undefined>
): Record<string, string> => {
	const queryParams = {};
	for (const [key, value] of Object.entries(values)) {
		if (value != null) {
			queryParams[key] = value.toString();
		}
	}
	return queryParams;
};
