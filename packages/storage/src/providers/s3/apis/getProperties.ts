// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	GetPropertiesInput,
	GetPropertiesInputKey,
	GetPropertiesInputPath,
	GetPropertiesOutput,
	GetPropertiesOutputKey,
	GetPropertiesOutputPath,
	S3Exception,
} from '../types';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

import { getProperties as getPropertiesInternal } from './internal/getProperties';

/**
 * Gets the properties of a file. The properties include S3 system metadata and
 * the user metadata that was provided when uploading the file.
 *
 * @param input - The GetPropertiesInput object.
 * @returns Requested object properties.
 * @throws A {@link S3Exception} when the underlying S3 service returned error.
 * @throws A {@link StorageValidationErrorCode} when API call parameters are invalid.
 */

interface GetProperties {
	/**
	 * Gets the properties of a file. The properties include S3 system metadata and
	 * the user metadata that was provided when uploading the file.
	 *
	 * @param input - The GetPropertiesInput object.
	 * @returns Requested object properties.
	 * @throws An {@link S3Exception} when the underlying S3 service returned error.
	 * @throws A {@link StorageValidationErrorCode} when API call parameters are invalid.
	 */
	(input: GetPropertiesInputPath): Promise<GetPropertiesOutputPath>;
	/**
	 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/download/#downloaddata | path} instead.
	 *
	 * Gets the properties of a file. The properties include S3 system metadata and
	 * the user metadata that was provided when uploading the file.
	 *
	 * @param input - The GetPropertiesInput object.
	 * @returns Requested object properties.
	 * @throws An {@link S3Exception} when the underlying S3 service returned error.
	 * @throws A {@link StorageValidationErrorCode} when API call parameters are invalid.
	 */
	(input: GetPropertiesInputKey): Promise<GetPropertiesOutputKey>;
}

export const getProperties: GetProperties = <
	Output extends GetPropertiesOutput,
>(
	input: GetPropertiesInput,
): Promise<Output> => {
	return getPropertiesInternal(Amplify, input) as Promise<Output>;
};
