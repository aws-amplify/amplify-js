// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { DownloadDataInput, DownloadDataOutput, S3Exception } from '../types';
import { resolveS3ConfigAndInput } from '../utils/resolveS3ConfigAndInput';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { createDownloadTask } from '../utils';
import { getObject } from '../utils/client';
import { getStorageUserAgentValue } from '../utils/userAgent';
import { logger } from '../../../utils';

/**
 * Download S3 object data to memory
 *
 * @param input - The DownloadDataInput object.
 * @returns A cancelable task exposing result promise from `result` property.
 * @throws service: {@link S3Exception} - thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors
 *
 * @example
 * ```ts
 * // Download a file from s3 bucket
 * const { body, eTag } = await downloadData({ key, data: file, options: {
 *   onProgress, // Optional progress callback.
 * } }).result;
 * ```
 * @example
 * ```ts
 * // Cancel a task
 * const downloadTask = downloadData({ key, data: file });
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
export const downloadData = (input: DownloadDataInput): DownloadDataOutput => {
	const abortController = new AbortController();

	const downloadTask = createDownloadTask({
		job: downloadDataJob(input, abortController.signal),
		onCancel: (message?: string) => {
			abortController.abort(message);
		},
	});
	return downloadTask;
};

const downloadDataJob =
	(
		{ options: downloadDataOptions, key }: DownloadDataInput,
		abortSignal: AbortSignal
	) =>
	async () => {
		const { bucket, keyPrefix, s3Config } = await resolveS3ConfigAndInput(
			Amplify,
			downloadDataOptions
		);
		const finalKey = keyPrefix + key;

		logger.debug(`download ${key} from ${finalKey}.`);

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
			}
		);
		return {
			key,
			body,
			lastModified,
			size,
			contentType,
			eTag,
			metadata,
			versionId,
		};
	};
