// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Headers } from '@aws-amplify/core/internals/aws-client-utils';
import { ServiceError } from '@aws-amplify/core/internals/utils';

import { StorageError } from '../../../../../errors/StorageError';

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
export const map = <Instructions extends { [key: string]: Instruction<any> }>(
	obj: Record<string, any>,
	instructions: Instructions
): {
	[K in keyof Instructions]: InferInstructionResultType<Instructions[K]>;
} => {
	const result = {} as Record<keyof Instructions, any>;
	for (const [key, instruction] of Object.entries(instructions)) {
		const [accessor, deserializer] = Array.isArray(instruction)
			? instruction
			: [instruction];
		if (obj.hasOwnProperty(accessor)) {
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
 * Function that makes sure the deserializer receives non-empty array.
 *
 * @internal
 */
export const emptyArrayGuard = <T extends Array<any>>(
	value: any,
	deserializer: (value: any[]) => T
): T => {
	if (value === '') {
		return [] as any as T;
	}
	const valueArray = (Array.isArray(value) ? value : [value]).filter(
		e => e != null
	);
	return deserializer(valueArray);
};

/**
 * @internal
 */
export const deserializeMetadata = (
	headers: Headers
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

/**
 * Internal-only method to create a new StorageError from a service error.
 *
 * @internal
 */
export const buildStorageServiceError = (
	error: Error,
	statusCode: number
): ServiceError => {
	const storageError = new StorageError({
		name: error.name,
		message: error.message,
	});
	if (statusCode === 404) {
		storageError.recoverySuggestion =
			'Please add the object with this key to the bucket as the key is not found.';
	}
	return storageError;
};
