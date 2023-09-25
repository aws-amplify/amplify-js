// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { GetUrlInput, GetUrlOutput, S3Exception } from '../types';
import { getUrl as getUrlInternal } from './internal/getUrl';

/**
 * Get a temporary presigned URL to download the specified S3 object.
 * The presigned URL expires when the associated role used to sign the request expires or
 * the option  `expiresIn` is reached. The `expiresAt` property in the output object indicates when the URL MAY expire.
 *
 * By default, it will not validate the object that exists in S3. If you set the `options.validateObjectExistence`
 * to true, this method will verify the given object already exists in S3 before returning a presigned
 * URL, and will throw {@link StorageError} if the object does not exist.
 *
 * @param input - The GetUrlInput object.
 * @returns Presigned URL and timestamp when the URL MAY expire.
 * @throws service: {@link S3Exception} - thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors
 * thrown either username or key are not defined.
 *
 */
export const getUrl = (input: GetUrlInput): Promise<GetUrlOutput> => {
	return getUrlInternal(Amplify, input);
};
