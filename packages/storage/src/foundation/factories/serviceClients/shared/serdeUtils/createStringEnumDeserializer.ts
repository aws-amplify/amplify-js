// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageError } from '../../../../../errors/StorageError';

/**
 * Create a function deserializing a string to an enum value. If the string is not a valid enum value, it throws a
 * StorageError.
 *
 * @example
 * ```typescript
 * const deserializeStringEnum = createStringEnumDeserializer(['a', 'b', 'c'] as const, 'FieldName');
 * const deserializedArray = ['a', 'b', 'c'].map(deserializeStringEnum);
 * // deserializedArray = ['a', 'b', 'c']
 *
 * const invalidValue = deserializeStringEnum('d');
 * // Throws InvalidFieldName: Invalid FieldName: d
 * ```
 *
 * @internal
 */
export const createStringEnumDeserializer =
	<T extends readonly string[]>(enumValues: T, fieldName: string) =>
	(value: any): T extends (infer E)[] ? E : never => {
		const parsedEnumValue = value
			? (enumValues.find(enumValue => enumValue === value) as any)
			: undefined;
		if (!parsedEnumValue) {
			throw new StorageError({
				name: `Invalid${fieldName}`,
				message: `Invalid ${fieldName}: ${value}`,
				recoverySuggestion:
					'This is likely to be a bug. Please reach out to library authors.',
			});
		}

		return parsedEnumValue;
	};
