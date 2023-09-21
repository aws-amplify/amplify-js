// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const recordToTupleList = <T>(
	record: Record<string, T>
): Array<[string, T]> => {
	return Object.keys(record).reduce(
		(result, current) => [...result, [current, record[current]]],
		[] as Array<[string, T]>
	);
};
