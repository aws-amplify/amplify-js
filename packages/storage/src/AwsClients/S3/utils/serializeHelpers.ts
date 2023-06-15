// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @internal
 */
export const assignSerializableValues = (
	values: Record<string, any>
): Record<string, string> => {
	const isSerializable = (value: any): value is string =>
		value !== undefined &&
		value !== null &&
		value !== '' &&
		(!Object.getOwnPropertyNames(value).includes('length') ||
			value.length !== 0) &&
		(!Object.getOwnPropertyNames(value).includes('size') || value.size !== 0);
	const headerEntries = Object.entries(values).filter(([, value]) =>
		isSerializable(value)
	) as [string, string][];
	return Object.fromEntries(headerEntries);
};
