// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ErrorParser,
	Headers,
} from '@aws-amplify/core/internals/aws-client-utils';
import { ServiceError } from '@aws-amplify/core/internals/utils';

import { StorageError } from '../../../../../errors/StorageError';
import { CompletedPart } from '../s3data';

type PropertyNameWithStringValue = string;
type PropertyNameWithSubsequentDeserializer<T> = [string, (arg: any) => T];
type Instruction<T> =
	| PropertyNameWithStringValue
	| PropertyNameWithSubsequentDeserializer<T>;

type InferInstructionResultType<T extends Instruction<any>> =
	| (T extends PropertyNameWithSubsequentDeserializer<infer R> ? R : string)
	| never;

/**
 * Maps an object to a new object using the provided instructions.
 * The instructions are a map of the returning mapped object's property names to a single instruction of how to map the
 * value from the original object to the new object. There are two types of instructions:
 *
 * 1. A string representing the property name of the original object to map to the new object. The value mapped from
 * the original object will be the same as the value in the new object, and it can ONLY be string.
 *
 * 2. An array of two elements. The first element is the property name of the original object to map to the new object.
 * The second element is a function that takes the value from the original object and returns the value to be mapped to
 * the new object. The function can return any type.
 *
 * Example:
 * ```typescript
 * const input = {
 *   Foo: 'foo',
 *   BarList: [{value: 'bar1'}, {value: 'bar2'}]
 * }
 * const output = map(input, {
 *   someFoo: 'Foo',
 *   bar: ['BarList', (barList) => barList.map(bar => bar.value)]
 *   baz: 'Baz' // Baz does not exist in input, so it will not be in the output.
 * });
 * // output = { someFoo: 'foo', bar: ['bar1', 'bar2'] }
 * ```
 *
 * @param obj The object containing the data to compose mapped object.
 * @param instructions The instructions mapping the object values to the new object.
 * @returns A new object with the mapped values.
 *
 * @internal
 */
export const map = <Instructions extends Record<string, Instruction<any>>>(
	obj: Record<string, any>,
	instructions: Instructions,
): {
	[K in keyof Instructions]: InferInstructionResultType<Instructions[K]>;
} => {
	const result = {} as Record<keyof Instructions, any>;
	for (const [key, instruction] of Object.entries(instructions)) {
		const [accessor, deserializer] = Array.isArray(instruction)
			? instruction
			: [instruction];
		if (Object.prototype.hasOwnProperty.call(obj, accessor)) {
			result[key as keyof Instructions] = deserializer
				? deserializer(obj[accessor])
				: String(obj[accessor]);
		}
	}

	return result;
};

/**
 * Deserializes a string to a number. Returns undefined if input is undefined.
 *
 * @internal
 */
export const deserializeNumber = (value?: string): number | undefined =>
	value ? Number(value) : undefined;

/**
 * Deserializes a string to a boolean. Returns undefined if input is undefined. Returns true if input is 'true',
 * otherwise false.
 *
 * @internal
 */
export const deserializeBoolean = (value?: string): boolean | undefined => {
	return value ? value === 'true' : undefined;
};

/**
 * Deserializes a string to a Date. Returns undefined if input is undefined.
 * It supports epoch timestamp; rfc3339(cannot have a UTC, fractional precision supported); rfc7231(section 7.1.1.1)
 *
 * @see https://www.epoch101.com/
 * @see https://datatracker.ietf.org/doc/html/rfc3339.html#section-5.6
 * @see https://datatracker.ietf.org/doc/html/rfc7231.html#section-7.1.1.1
 *
 * @note For bundle size consideration, we use Date constructor to parse the timestamp string. There might be slight
 * difference among browsers.
 *
 * @internal
 */
export const deserializeTimestamp = (value: string): Date | undefined => {
	return value ? new Date(value) : undefined;
};

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
export const createStringEnumDeserializer = <T extends readonly string[]>(
	enumValues: T,
	fieldName: string,
) => {
	const deserializeStringEnum = (
		value: any,
	): T extends (infer E)[] ? E : never => {
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

	return deserializeStringEnum;
};

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

/**
 * @internal
 */
export const deserializeMetadata = (
	headers: Headers,
): Record<string, string> => {
	const objectMetadataHeaderPrefix = 'x-amz-meta-';
	const deserialized = Object.keys(headers)
		.filter(header => header.startsWith(objectMetadataHeaderPrefix))
		.reduce((acc, header) => {
			acc[header.replace(objectMetadataHeaderPrefix, '')] = headers[header];

			return acc;
		}, {} as any);

	return Object.keys(deserialized).length > 0 ? deserialized : undefined;
};

export type ParsedError = Awaited<ReturnType<ErrorParser>> & {};

/**
 * Internal-only method to create a new StorageError from a service error with AWS SDK-compatible interfaces
 * @param error - The output of a service error parser, with AWS SDK-compatible interface(e.g. $metadata)
 * @returns A new StorageError.
 *
 * @internal
 */
export const buildStorageServiceError = (error: ParsedError): ServiceError =>
	new StorageError({
		name: error.name,
		message: error.message,
		metadata: error.$metadata,
	});

/**
 * Internal-only method used for deserializing the parts of a multipart upload.
 *
 * @internal
 */
export const deserializeCompletedPartList = (input: any[]): CompletedPart[] =>
	input.map(item =>
		map(item, {
			PartNumber: ['PartNumber', deserializeNumber],
			ETag: 'ETag',
			ChecksumCRC32: 'ChecksumCRC32',
		}),
	);
