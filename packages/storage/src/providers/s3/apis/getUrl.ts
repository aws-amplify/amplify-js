// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	GetUrlInput,
	GetUrlInputWithPath,
	GetUrlOutput,
	GetUrlOutputWithPath,
} from '../types';

import { getUrl as getUrlInternal } from './internal/getUrl';

interface GetUrl {
	/**
	 * Get a temporary presigned URL to download the specified S3 object.
	 * The presigned URL expires when the associated role used to sign the request expires or
	 * the option  `expiresIn` is reached. The `expiresAt` property in the output object indicates when the URL MAY expire.
	 *
	 * By default, it will not validate the object that exists in S3. If you set the `options.validateObjectExistence`
	 * to true, this method will verify the given object already exists in S3 before returning a presigned
	 * URL, and will throw `StorageError` if the object does not exist.
	 *
	 * @param input - The `GetUrlInputWithPath` object.
	 * @returns Presigned URL and timestamp when the URL MAY expire.
	 * @throws service: `S3Exception` - thrown when checking for existence of the object
	 * @throws validation: `StorageValidationErrorCode` - Validation errors
	 * thrown either username or key are not defined.
	 *
	 */
	(input: GetUrlInputWithPath): Promise<GetUrlOutputWithPath>;
	/**
	 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/javascript/build-a-backend/storage/download/#generate-a-download-url | path} instead.
	 *
	 * Get a temporary presigned URL to download the specified S3 object.
	 * The presigned URL expires when the associated role used to sign the request expires or
	 * the option  `expiresIn` is reached. The `expiresAt` property in the output object indicates when the URL MAY expire.
	 *
	 * By default, it will not validate the object that exists in S3. If you set the `options.validateObjectExistence`
	 * to true, this method will verify the given object already exists in S3 before returning a presigned
	 * URL, and will throw `StorageError` if the object does not exist.
	 *
	 * @param input - The `GetUrlInputWithKey` object.
	 * @returns Presigned URL and timestamp when the URL MAY expire.
	 * @throws service: `S3Exception` - thrown when checking for existence of the object
	 * @throws validation: `StorageValidationErrorCode` - Validation errors
	 * thrown either username or key are not defined.
	 *
	 */
	(input: GetUrlInput): Promise<GetUrlOutput>;
}

export const getUrl: GetUrl = (
	input: GetUrlInput | GetUrlInputWithPath,
): Promise<GetUrlOutput | GetUrlOutputWithPath> =>
	getUrlInternal(Amplify, input);
