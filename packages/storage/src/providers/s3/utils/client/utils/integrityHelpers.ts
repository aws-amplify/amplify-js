// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const isNil = <T>(value?: T) => {
	return value === undefined || value === null;
};

export const bothNilOrEqual = (original?: string, output?: string): boolean => {
	return (isNil(original) && isNil(output)) || original === output;
};

/**
 * This function is used to determine if a value is an object.
 * It excludes arrays and null values.
 *
 * @param value
 * @returns
 */
export const isObject = <T>(value?: T) => {
	return value != null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * This function is used to compare two objects and determine if they are equal.
 * It handles nested objects and arrays as well.
 * Array order is not taken into account.
 *
 * @param object
 * @param other
 * @returns
 */
export const isEqual = <T>(object: T, other: T): boolean => {
	if (Array.isArray(object) && !Array.isArray(other)) {
		return false;
	}
	if (!Array.isArray(object) && Array.isArray(other)) {
		return false;
	}
	if (Array.isArray(object) && Array.isArray(other)) {
		return (
			object.length === other.length &&
			object.every((val, ix) => isEqual(val, other[ix]))
		);
	}
	if (!isObject<T>(object) || !isObject<T>(other)) {
		return object === other;
	}

	const objectKeys = Object.keys(object as any);
	const otherKeys = Object.keys(other as any);

	if (objectKeys.length !== otherKeys.length) {
		return false;
	}

	return objectKeys.every(key => {
		return (
			otherKeys.includes(key) &&
			isEqual(object[key as keyof T] as any, other[key as keyof T] as any)
		);
	});
};
