// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { getUrl as getUrlInternal } from '../../providers/s3/apis/internal/getUrl';
import { GetUrlInput } from '../types/inputs';
import { GetUrlOutput } from '../types/outputs';

/**
 * Get a temporary presigned URL to download the specified S3 object.
 * The presigned URL expires when the associated role used to sign the request expires or
 * the option  `expiresIn` is reached. The `expiresAt` property in the output object indicates when the URL MAY expire.
 *
 * By default, it will not validate the object that exists in S3. If you set the `options.validateObjectExistence`
 * to true, this method will verify the given object already exists in S3 before returning a presigned
 * URL, and will throw `StorageError` if the object does not exist.
 *
 * @param input - The `GetUrlWithPathInput` object.
 * @returns Presigned URL and timestamp when the URL may expire.
 * @throws service: `S3Exception` - thrown when checking for existence of the object
 * @throws validation: `StorageValidationErrorCode` - Validation errors
 * thrown either username or key are not defined.
 *
 * @internal
 */
export function getUrl(input: GetUrlInput) {
	return getUrlInternal(Amplify, {
		path: input.path,
		options: {
			useAccelerateEndpoint: input?.options?.useAccelerateEndpoint,
			bucket: input?.options?.bucket,
			validateObjectExistence: input?.options?.validateObjectExistence,
			expiresIn: input?.options?.expiresIn,
			contentDisposition: input?.options?.contentDisposition,
			contentType: input?.options?.contentType,

			// Advanced options
			locationCredentialsProvider: input?.options?.locationCredentialsProvider,
		},
		// Type casting is necessary because `getPropertiesInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	}) as Promise<GetUrlOutput>;
}
