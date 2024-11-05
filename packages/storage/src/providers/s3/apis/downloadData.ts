// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	DownloadDataInput,
	DownloadDataOutput,
	DownloadDataWithPathInput,
	DownloadDataWithPathOutput,
} from '../types';
import { resolveS3ConfigAndInput } from '../utils/resolveS3ConfigAndInput';
import { createDownloadTask, validateStorageOperationInput } from '../utils';
import { getObject } from '../utils/client';
import { getStorageUserAgentValue } from '../utils/userAgent';
import { logger } from '../../../utils';
import {
	StorageDownloadDataOutput,
	StorageItemWithKey,
	StorageItemWithPath,
} from '../../../types';
import { STORAGE_INPUT_KEY } from '../utils/constants';

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
	const abortController = new AbortController();

	const downloadTask = createDownloadTask({
		job: downloadDataJob(input, abortController.signal),
		onCancel: (message?: string) => {
			abortController.abort(message);
		},
	});

	return downloadTask;
}

const downloadDataJob =
	(
		downloadDataInput: DownloadDataInput | DownloadDataWithPathInput,
		abortSignal: AbortSignal,
	) =>
	async (): Promise<
		StorageDownloadDataOutput<StorageItemWithKey | StorageItemWithPath>
	> => {
		const { options: downloadDataOptions } = downloadDataInput;
		const { bucket, keyPrefix, s3Config, identityId } =
			await resolveS3ConfigAndInput(Amplify, downloadDataOptions);
		const { inputType, objectKey } = validateStorageOperationInput(
			downloadDataInput,
			identityId,
		);
		const finalKey =
			inputType === STORAGE_INPUT_KEY ? keyPrefix + objectKey : objectKey;

		logger.debug(`download ${objectKey} from ${finalKey}.`);

		const {
			Body: body,
			LastModified: lastModified,
			ContentLength: size,
			ETag: eTag,
			Metadata: metadata,
			VersionId: versionId,
			ContentType: contentType,
		} = await getObject(
			{
				...s3Config,
				abortSignal,
				onDownloadProgress: downloadDataOptions?.onProgress,
				userAgentValue: getStorageUserAgentValue(StorageAction.DownloadData),
			},
			{
				Bucket: bucket,
				Key: finalKey,
				...(downloadDataOptions?.bytesRange && {
					Range: `bytes=${downloadDataOptions.bytesRange.start}-${downloadDataOptions.bytesRange.end}`,
				}),
			},
		);

		const result = {
			body,
			lastModified,
			size,
			contentType,
			eTag,
			metadata,
			versionId,
		};

		return inputType === STORAGE_INPUT_KEY
			? { key: objectKey, ...result }
			: { path: objectKey, ...result };
	};
