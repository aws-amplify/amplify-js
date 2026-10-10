// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import {
	GetPropertiesInput,
	GetPropertiesOutput,
	GetPropertiesWithPathInput,
	GetPropertiesWithPathOutput,
} from '../types';

import { getProperties as getPropertiesInternal } from './internal/getProperties';
/**
 * @param ctx - The AmplifyContext to operate on.
 * @param input - The `GetPropertiesWithPathInput` object.
 */
export function getProperties(
	ctx: AmplifyContext,
	input: GetPropertiesWithPathInput,
): Promise<GetPropertiesWithPathOutput>;
/**
 * @param ctx - The AmplifyContext to operate on.
 * @param input - The `GetPropertiesInput` object.
 */
export function getProperties(
	ctx: AmplifyContext,
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput>;

/**
 * Gets the properties of a file. The properties include S3 system metadata and
 * the user metadata that was provided when uploading the file.
 *
 * @param input - The `GetPropertiesWithPathInput` object.
 * @returns Requested object properties.
 * @throws An `S3Exception` when the underlying S3 service returned error.
 * @throws A `StorageValidationErrorCode` when API call parameters are invalid.
 */
export function getProperties(
	input: GetPropertiesWithPathInput,
): Promise<GetPropertiesWithPathOutput>;
/**
 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/javascript/build-a-backend/storage/get-properties/ | path} instead.
 *
 * Gets the properties of a file. The properties include S3 system metadata and
 * the user metadata that was provided when uploading the file.
 *
 * @param input - The `GetPropertiesInput` object.
 * @returns Requested object properties.
 * @throws An `S3Exception` when the underlying S3 service returned error.
 * @throws A `StorageValidationErrorCode` when API call parameters are invalid.
 */
export function getProperties(
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput>;

// Overload signatures above are the public contract; the impl is intentionally untyped and shape is enforced by resolveCtxArgs.
export function getProperties(...args: any[]) {
	const [ctx, input] =
		resolveCtxArgs<[GetPropertiesInput | GetPropertiesWithPathInput]>(args);

	return getPropertiesInternal(ctx, input);
}
