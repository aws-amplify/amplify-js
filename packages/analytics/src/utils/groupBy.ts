// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const groupBy = <T>(
	getGroupId: (x: T) => string,
	list: T[]
): Record<string, T[]> => {
	return list.reduce(
		(result, current) => {
			const groupId = getGroupId(current);
			return { ...result, [groupId]: [...(result[groupId] ?? []), current] };
		},
		{} as Record<string, T[]>
	);
};
