// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { downloadData as downloadDataInternal } from '../../providers/s3/apis/internal/downloadData';
import { DownloadDataInput } from '../types/inputs';
import { DownloadDataOutput } from '../types/outputs';

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
 *
 * @internal
 */
export const downloadData = (input: DownloadDataInput): DownloadDataOutput =>
	downloadDataInternal(input) as DownloadDataOutput;
