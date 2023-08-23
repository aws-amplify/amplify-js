// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageDownloadDataRequest, DownloadTask } from '../../../types';
import { S3TransferOptions, S3DownloadDataResult } from '../types';
import {
	getKeyWithPrefix,
	resolveCredentials,
	resolveStorageConfig,
} from '../utils';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { createDownloadTask } from '../../../utils/transferTask';
import { getObject } from '../../../AwsClients/S3';
import { validateS3RequiredParameter } from '../../../AwsClients/S3/utils';

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
		abortController,
	});
	return downloadTask;
};

const downloadDataJob =
	(
		downloadDataRequest: StorageDownloadDataRequest<S3TransferOptions>,
		abortSignal: AbortSignal
	) =>
	async () => {
		// TODO[AllanZhengYP]: refactor this to reduce duplication
		const options = downloadDataRequest?.options ?? {};
		const { credentials, identityId } = await resolveCredentials();
		const { defaultAccessLevel, bucket, region } = resolveStorageConfig();
		const {
			key,
			options: {
				accessLevel = defaultAccessLevel,
				onProgress,
				useAccelerateEndpoint,
			} = {},
		} = downloadDataRequest;
		assertValidationError(!!key, StorageValidationErrorCode.NoKey);

		const finalKey = getKeyWithPrefix({
			accessLevel,
			targetIdentityId:
				options.accessLevel === 'protected'
					? options.targetIdentityId
					: identityId,
			key,
		});

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
				credentials,
				region,
				abortSignal,
				onDownloadProgress: onProgress,
				useAccelerateEndpoint,
			},
			{
				Bucket: bucket,
				Key: finalKey,
			}
		);
		validateS3RequiredParameter(!!body, 'Body');
		return {
			body,
			lastModified,
			size,
			contentType,
			eTag,
			metadata,
			versionId,
		};
	};
