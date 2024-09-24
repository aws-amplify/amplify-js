// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Function that makes sure the deserializer receives non-empty array.
 *
 * @internal
 */
export const emptyArrayGuard = <T extends any[]>(
	value: any,
	deserializer: (value: any[]) => T,
): T => {
	if (value === '') {
		return [] as any as T;
	}
	const valueArray = (Array.isArray(value) ? value : [value]).filter(
		e => e != null,
	);

	return deserializer(valueArray);
};
