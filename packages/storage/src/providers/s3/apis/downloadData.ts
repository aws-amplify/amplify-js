// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { DownloadDataInput, DownloadDataOutput } from '../types';
import { resolveS3ConfigAndInput } from '../utils/resolveS3ConfigAndInput';
import { createDownloadTask, validateStorageOperationInput } from '../utils';
import { getObject } from '../utils/client';
import { getStorageUserAgentValue } from '../utils/userAgent';
import { logger } from '../../../utils';
import {
	StorageDownloadDataOutput,
	StorageItemKey,
	StorageItemPath,
} from '../../../types';
import { STORAGE_INPUT_KEY } from '../utils/constants';
import { DownloadDataInputKey, DownloadDataInputPath } from '../types/inputs';
import {
	DownloadDataOutputKey,
	DownloadDataOutputPath,
} from '../types/outputs';

interface DownloadData {
	/**
	 * Download S3 object data to memory
	 *
	 * @param input - The DownloadDataInputPath object.
	 * @returns A cancelable task exposing result promise from `result` property.
	 * @throws service: {@link S3Exception} - thrown when checking for existence of the object
	 * @throws validation: {@link StorageValidationErrorCode } - Validation errors
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
	(input: DownloadDataInputPath): DownloadDataOutputPath;
	/**
	 * @deprecated The `key` and `accessLevel` parameters are deprecated and will be removed in next major version.
	 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/download/#downloaddata | path} instead.
	 *
	 * Download S3 object data to memory
	 *
	 * @param input - The DownloadDataInputKey object.
	 * @returns A cancelable task exposing result promise from `result` property.
	 * @throws service: {@link S3Exception} - thrown when checking for existence of the object
	 * @throws validation: {@link StorageValidationErrorCode } - Validation errors
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
	(input: DownloadDataInputKey): DownloadDataOutputKey;
}

export const downloadData: DownloadData = <Output extends DownloadDataOutput>(
	input: DownloadDataInput,
): Output => {
	const abortController = new AbortController();

	const downloadTask = createDownloadTask({
		job: downloadDataJob(input, abortController.signal),
		onCancel: (message?: string) => {
			abortController.abort(message);
		},
	});

	return downloadTask as Output;
};

const downloadDataJob =
	(downloadDataInput: DownloadDataInput, abortSignal: AbortSignal) =>
	async (): Promise<
		StorageDownloadDataOutput<StorageItemKey | StorageItemPath>
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
			: { path: finalKey, ...result };
	};
