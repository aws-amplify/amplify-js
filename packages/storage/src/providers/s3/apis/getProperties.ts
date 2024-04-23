// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	GetPropertiesInput,
	GetPropertiesOutput,
	GetPropertiesWithPathInput,
	GetPropertiesWithPathOutput,
} from '../types';

import { getProperties as getPropertiesInternal } from './internal/getProperties';

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

export function getProperties(
	input: GetPropertiesInput | GetPropertiesWithPathInput,
) {
	return getPropertiesInternal(Amplify, input);
}
