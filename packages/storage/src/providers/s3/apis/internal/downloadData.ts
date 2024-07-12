import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	StorageDownloadDataOutput,
	StorageItemWithKey,
	StorageItemWithPath,
} from '../../../../types';
import { logger } from '../../../../utils';
import { DownloadDataInput, DownloadDataWithPathInput } from '../../types';
import {
	createDownloadTask,
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../utils';
import { getObject } from '../../utils/client';
import { STORAGE_INPUT_KEY } from '../../utils/constants';
import { getStorageUserAgentValue } from '../../utils/userAgent';

import { S3InternalConfig } from './types';

export function internalDownloadData(
	input: DownloadDataInput | DownloadDataWithPathInput,
	config: S3InternalConfig,
) {
	const abortController = new AbortController();

	const downloadTask = createDownloadTask({
		job: downloadDataJob(input, abortController.signal, config),
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
		config: S3InternalConfig,
	) =>
	async (): Promise<
		StorageDownloadDataOutput<StorageItemWithKey | StorageItemWithPath>
	> => {
		const { options: downloadDataOptions } = downloadDataInput;

		const { bucket, keyPrefix, s3Config, identityId } =
			await resolveS3ConfigAndInput({
				config,
				apiOptions: downloadDataOptions,
			});
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
