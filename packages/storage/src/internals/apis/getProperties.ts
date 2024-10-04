// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { getProperties as getPropertiesInternal } from '../../providers/s3/apis/internal/getProperties';
import { GetPropertiesInput } from '../types/inputs';
import { GetPropertiesOutput } from '../types/outputs';

/**
 * Gets the properties of a file. The properties include S3 system metadata and
 * the user metadata that was provided when uploading the file.
 * @param input - The `GetPropertiesWithPathInput` object.
 * @returns Requested object properties.
 * @throws An `S3Exception` when the underlying S3 service returned error.
 * @throws A `StorageValidationErrorCode` when API call parameters are invalid.
 *
 * @internal
 */
export const getProperties = (
	input: GetPropertiesInput,
): Promise<GetPropertiesOutput> =>
	getPropertiesInternal(Amplify, {
		path: input.path,
		options: {
			useAccelerateEndpoint: input?.options?.useAccelerateEndpoint,
			bucket: input?.options?.bucket,
			locationCredentialsProvider: input?.options?.locationCredentialsProvider,
		},
		// Type casting is necessary because `getPropertiesInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as Promise<GetPropertiesOutput>;
