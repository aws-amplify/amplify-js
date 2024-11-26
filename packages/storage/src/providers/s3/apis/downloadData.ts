// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DownloadDataInput,
	DownloadDataOutput,
	DownloadDataWithPathInput,
	DownloadDataWithPathOutput,
} from '../types';

import { downloadData as downloadDataInternal } from './internal/downloadData';

/**
 * Download S3 object data to memory
 *
 * @param input - The `DownloadDataWithPathInput` object.
 * @returns A cancelable task exposing result promise from `result` property.
 * @throws service: `S3Exception` - thrown when checking for existence of the object
 * @throws validation: `StorageValidationErrorCode` - Validation errors
 *
 * @example
 * ```ts
 * // Download a file from s3 bucket
 * const { body, eTag } = await downloadData({ path, options: {
 *   onProgress, // Optional progress callback.
 * } }).result;
 * ```
 * @example
 * ```ts
 * // Cancel a task
 * const downloadTask = downloadData({ path });
 * //...
 * downloadTask.cancel();
 * try {
 * 	await downloadTask.result;
 * } catch (error) {
 * 	if(isCancelError(error)) {
 *    // Handle error thrown by task cancelation.
 * 	}
 * }
 *```
 */
export function downloadData(
	input: DownloadDataWithPathInput,
): DownloadDataWithPathOutput;
/**
 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/download/#downloaddata | path} instead.
 *
 * Download S3 object data to memory
 *
 * @param input - The `DownloadDataInput` object.
 * @returns A cancelable task exposing result promise from `result` property.
 * @throws service: `S3Exception` - thrown when checking for existence of the object
 * @throws validation: `StorageValidationErrorCode` - Validation errors
 *
 * @example
 * ```ts
 * // Download a file from s3 bucket
 * const { body, eTag } = await downloadData({ key, options: {
 *   onProgress, // Optional progress callback.
 * } }).result;
 * ```
 * @example
 * ```ts
 * // Cancel a task
 * const downloadTask = downloadData({ key });
 * //...
 * downloadTask.cancel();
 * try {
 * 	await downloadTask.result;
 * } catch (error) {
 * 	if(isCancelError(error)) {
 *    // Handle error thrown by task cancelation.
 * 	}
 * }
 *```
 */
export function downloadData(input: DownloadDataInput): DownloadDataOutput;
export function downloadData(
	input: DownloadDataInput | DownloadDataWithPathInput,
) {
	return downloadDataInternal(input);
}
