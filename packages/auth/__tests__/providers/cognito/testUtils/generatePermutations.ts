// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Generates all possible permutations of an object
 * in which each key has the possible values
 * @param keys an array of keys for the object
 * @param values an array of possible values for each object[key]
 * @returns an array of objects
 */
export const generatePermutations = <T>(
	keys: string[],
	values: T[],
): Record<string, T>[] => {
	if (!keys.length) return [{}];

	const [curr, ...rest] = keys;
	const permutations: Record<string, T>[] = [];

	for (const value of values) {
		for (const perm of generatePermutations(rest, values)) {
			permutations.push({ ...perm, [curr]: value });
		}
	}

	return permutations;
};
