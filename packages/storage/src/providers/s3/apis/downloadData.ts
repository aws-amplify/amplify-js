// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { S3TransferOptions, S3DownloadDataResult } from '../types';
import { resolveS3ConfigAndInput } from '../utils/resolveS3ConfigAndInput';
import { getObject } from '../../../AwsClients/S3';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { StorageDownloadDataRequest, DownloadTask } from '../../../types';
import { createDownloadTask } from '../utils/transferTask';

/**
 * Download S3 object data to memory
 *
 * @param {StorageDownloadDataRequest<S3TransferOptions>} downloadDataRequest The parameters that are passed to the
 * 	downloadData operation.
 * @returns {DownloadTask<S3DownloadDataResult>} Cancelable task exposing result promise from `result` property.
 * @throws service: {@link S3Exception} - thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors
 * thrown either username or key are not defined.
 *
 * TODO: add config errors
 */
export const downloadData = (
	downloadDataRequest: StorageDownloadDataRequest<S3TransferOptions>
): DownloadTask<S3DownloadDataResult> => {
	const abortController = new AbortController();

	const downloadTask = createDownloadTask({
		job: downloadDataJob(downloadDataRequest, abortController.signal),
		onCancel: (abortErrorOverwrite?: Error) => {
			abortController.abort(abortErrorOverwrite);
		},
	});
	return downloadTask;
};

const downloadDataJob =
	(
		{
			options: downloadDataOptions,
			key,
		}: StorageDownloadDataRequest<S3TransferOptions>,
		abortSignal: AbortSignal
	) =>
	async () => {
		const { bucket, keyPrefix, s3Config } = await resolveS3ConfigAndInput(
			downloadDataOptions
		);
		// TODO[AllanZhengYP]: support excludeSubPaths option to exclude sub paths
		const finalKey = keyPrefix + key;

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
			},
			{
				Bucket: bucket,
				Key: finalKey,
			}
		);
		return {
			// Casting with ! as body always exists for getObject API.
			// TODO[AllanZhengYP]: remove casting when we have better typing for getObject API
			body: body!,
			lastModified,
			size,
			contentType,
			eTag,
			metadata,
			versionId,
		};
	};
