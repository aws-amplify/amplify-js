// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	UploadDataInput,
	UploadDataOutput,
	UploadDataWithPathInput,
	UploadDataWithPathOutput,
} from '../../types';
import { createUploadTask } from '../../utils';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { DEFAULT_PART_SIZE, MAX_OBJECT_SIZE } from '../../utils/constants';

import { byteLength } from './byteLength';
import { putObjectJob } from './putObjectJob';
import { getMultipartUploadHandlers } from './multipart';

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
	const { data } = input;

	const dataByteLength = byteLength(data);
	assertValidationError(
		dataByteLength === undefined || dataByteLength <= MAX_OBJECT_SIZE,
		StorageValidationErrorCode.ObjectIsTooLarge,
	);

	if (dataByteLength && dataByteLength <= DEFAULT_PART_SIZE) {
		// Single part upload
		const abortController = new AbortController();

		return createUploadTask({
			isMultipartUpload: false,
			job: putObjectJob(input, abortController.signal, dataByteLength),
			onCancel: (message?: string) => {
				abortController.abort(message);
			},
		});
	} else {
		// Multipart upload
		const { multipartUploadJob, onPause, onResume, onCancel } =
			getMultipartUploadHandlers(input, dataByteLength);

		return createUploadTask({
			isMultipartUpload: true,
			job: multipartUploadJob,
			onCancel: (message?: string) => {
				onCancel(message);
			},
			onPause,
			onResume,
		});
	}
}
