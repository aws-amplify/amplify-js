// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { resolveS3ConfigAndInput } from '../../utils/resolveS3ConfigAndInput';
import {
	createDownloadTask,
	validateBucketOwnerID,
	validateStorageOperationInput,
} from '../../utils';
import { getObject } from '../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';
import { DownloadDataInput, DownloadDataWithPathInput } from '../../types';
import { STORAGE_INPUT_KEY } from '../../utils/constants';
import {
	StorageDownloadDataOutput,
	StorageItemWithKey,
	StorageItemWithPath,
} from '../../../../types';
// TODO: Remove this interface when we move to public advanced APIs.
import { DownloadDataInput as DownloadDataWithPathInputWithAdvancedOptions } from '../../../../internals/types/inputs';

export const downloadData = (
	input: DownloadDataInput | DownloadDataWithPathInputWithAdvancedOptions,
) => {
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
		downloadDataInput: DownloadDataInput | DownloadDataWithPathInput,
		abortSignal: AbortSignal,
	) =>
	async (): Promise<
		StorageDownloadDataOutput<StorageItemWithKey | StorageItemWithPath>
	> => {
		const { options: downloadDataOptions } = downloadDataInput;
		const { bucket, keyPrefix, s3Config, identityId } =
			await resolveS3ConfigAndInput(Amplify, downloadDataInput);
		const { inputType, objectKey } = validateStorageOperationInput(
			downloadDataInput,
			identityId,
		);
		validateBucketOwnerID(downloadDataOptions?.expectedBucketOwner);
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
				ExpectedBucketOwner: downloadDataOptions?.expectedBucketOwner,
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
