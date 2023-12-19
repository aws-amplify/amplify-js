// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Iterates through a collection to find a matching item and returns the index.
 *
 * @param needle The item to search for
 * @param haystack The collection to search
 * @param keyFields The fields used to indicate a match
 * @returns Index of `needle` in `haystack`, otherwise -1 if not found.
 */
export function findIndexByFields<T>(
	needle: T,
	haystack: T[],
	keyFields: Array<keyof T>
): number {
	const searchObject = Object.fromEntries(
		keyFields.map(fieldName => [fieldName, needle[fieldName]])
	);

	for (let i = 0; i < haystack.length; i++) {
		if (
			Object.keys(searchObject).every(
				k => searchObject[k] === (haystack[i] as any)[k]
			)
		) {
			return i;
		}
	}

	return -1;
}
