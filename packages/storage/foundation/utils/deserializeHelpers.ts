// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ErrorParser,
	Headers,
} from '@aws-amplify/core/internals/aws-client-utils';
import { ServiceError } from '@aws-amplify/core/internals/utils';

import { StorageError } from './StorageError';

/**
 * @internal
 */
export const assignStringVariables = (
	values: Record<string, { toString(): string } | undefined>,
): Record<string, string> => {
	const queryParams: Record<string, string> = {};
	for (const [key, value] of Object.entries(values)) {
		if (value != null) {
			queryParams[key] = value.toString();
		}
	}

	return queryParams;
};

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
 *
 * @internal
 */
export const deserializeTimestamp = (value: string): Date | undefined => {
	return value ? new Date(value) : undefined;
};

/**
 * @internal
 */
export const deserializeMetadata = (
	headers: Headers,
): Record<string, string> | undefined => {
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
