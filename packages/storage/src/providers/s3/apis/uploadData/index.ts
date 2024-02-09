// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UploadDataInput, UploadDataOutput, S3Exception } from '../../types';
import { createUploadTask } from '../../utils';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { DEFAULT_PART_SIZE, MAX_OBJECT_SIZE } from '../../utils/constants';
import { byteLength } from './byteLength';
import { putObjectJob } from './putObjectJob';
import { getMultipartUploadHandlers } from './multipart';

/**
 * Upload data to specified S3 object. By default, it uses single PUT operation to upload if the data is less than 5MB.
 * Otherwise, it uses multipart upload to upload the data. If the data length is unknown, it uses multipart upload.
 *
 * Limitations:
 * * Maximum object size is 5TB.
 * * Maximum object size if the size cannot be determined before upload is 50GB.
 *
 * @param input - The UploadDataInput object.
 * @returns A cancelable and resumable task exposing result promise from `result`
 * 	property.
 * @throws service: {@link S3Exception} - thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors.
 *
 * @example
 * ```ts
 * // Upload a file to s3 bucket
 * await uploadData({ key, data: file, options: {
 *   onProgress, // Optional progress callback.
 * } }).result;
 * ```
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
export const uploadData = (input: UploadDataInput): UploadDataOutput => {
	const { data } = input;

	const dataByteLength = byteLength(data);
	assertValidationError(
		dataByteLength === undefined || dataByteLength <= MAX_OBJECT_SIZE,
		StorageValidationErrorCode.ObjectIsTooLarge
	);

	if (dataByteLength && dataByteLength <= DEFAULT_PART_SIZE) {
		const abortController = new AbortController();
		return createUploadTask({
			isMultipartUpload: false,
			job: putObjectJob(input, abortController.signal, dataByteLength),
			onCancel: (message?: string) => {
				abortController.abort(message);
			},
		});
	} else {
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
};
