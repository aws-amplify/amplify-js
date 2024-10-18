// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';

import {
	UploadDataInput,
	UploadDataOutput,
	UploadDataWithPathInput,
	UploadDataWithPathOutput,
} from '../types';

import { uploadData as uploadDataInternal } from './internal/uploadData';

/**
 * Upload data to the specified S3 object path. By default uses single PUT operation to upload if the payload is less than 5MB.
 * Otherwise, uses multipart upload to upload the payload. If the payload length cannot be determined, uses multipart upload.
 *
 * Limitations:
 * * Maximum object size is 5TB.
 * * Maximum object size if the size cannot be determined before upload is 50GB.
 *
 * @throws Service: `S3Exception` thrown when checking for existence of the object.
 * @throws Validation: `StorageValidationErrorCode` thrown when a validation error occurs.
 *
 * @param input - A `UploadDataWithPathInput` object.
 *
 * @returns A cancelable and resumable task exposing result promise from `result`
 * 	property.
 *
 * @example
 * ```ts
 * // Upload a file to s3 bucket
 * await uploadData({ path, data: file, options: {
 *   onProgress, // Optional progress callback.
 * } }).result;
 * ```
 *
 * @example
 * ```ts
 * // Cancel a task
 * const uploadTask = uploadData({ path, data: file });
 * //...
 * uploadTask.cancel();
 * try {
 *   await uploadTask.result;
 * } catch (error) {
 *   if(isCancelError(error)) {
 *     // Handle error thrown by task cancelation.
 *   }
 * }
 *```
 *
 * @example
 * ```ts
 * // Pause and resume a task
 * const uploadTask = uploadData({ path, data: file });
 * //...
 * uploadTask.pause();
 * //...
 * uploadTask.resume();
 * //...
 * await uploadTask.result;
 * ```
 */
export function uploadData(
	input: UploadDataWithPathInput,
): UploadDataWithPathOutput;

/**
 * Upload data to the specified S3 object key. By default uses single PUT operation to upload if the payload is less than 5MB.
 * Otherwise, uses multipart upload to upload the payload. If the payload length cannot be determined, uses multipart upload.
 *
 * Limitations:
 * * Maximum object size is 5TB.
 * * Maximum object size if the size cannot be determined before upload is 50GB.
 *
 * @deprecated The `key` and `accessLevel` parameters are deprecated and will be removed in next major version.
 * Please use {@link https://docs.amplify.aws/javascript/build-a-backend/storage/upload/#uploaddata | path} instead.
 *
 * @throws Service: `S3Exception` thrown when checking for existence of the object.
 * @throws Validation: `StorageValidationErrorCode` thrown when a validation error occurs.
 *
 * @param input - A `UploadDataInput` object.
 *
 * @returns A cancelable and resumable task exposing result promise from the `result` property.
 *
 * @example
 * ```ts
 * // Upload a file to s3 bucket
 * await uploadData({ key, data: file, options: {
 *   onProgress, // Optional progress callback.
 * } }).result;
 * ```
 *
 * @example
 * ```ts
 * // Cancel a task
 * const uploadTask = uploadData({ key, data: file });
 * //...
 * uploadTask.cancel();
 * try {
 *   await uploadTask.result;
 * } catch (error) {
 *   if(isCancelError(error)) {
 *     // Handle error thrown by task cancelation.
 *   }
 * }
 *```
 *
 * @example
 * ```ts
 * // Pause and resume a task
 * const uploadTask = uploadData({ key, data: file });
 * //...
 * uploadTask.pause();
 * //...
 * uploadTask.resume();
 * //...
 * await uploadTask.result;
 * ```
 */
export function uploadData(input: UploadDataInput): UploadDataOutput;

export function uploadData(input: UploadDataInput | UploadDataWithPathInput) {
	return uploadDataInternal({
		...input,
		options: {
			...input?.options,
			// This option enables caching in-progress multipart uploads.
			// It's ONLY needed for client-side API.
			resumableUploadsCache: defaultStorage,
		},
	});
}
