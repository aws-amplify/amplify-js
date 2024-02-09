// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { UploadDataInput } from '../../types';
import { calculateContentMd5, resolveS3ConfigAndInput } from '../../utils';
import { Item as S3Item } from '../../types/outputs';
import { putObject } from '../../utils/client';
import { getStorageUserAgentValue } from '../../utils/userAgent';

/**
 * Get a function the returns a promise to call putObject API to S3.
 *
 * @internal
 */
export const putObjectJob =
	(
		{ options: uploadDataOptions, key, data }: UploadDataInput,
		abortSignal: AbortSignal,
		totalLength?: number
	) =>
	async (): Promise<S3Item> => {
		const { bucket, keyPrefix, s3Config, isObjectLockEnabled } =
			await resolveS3ConfigAndInput(Amplify, uploadDataOptions);

		const finalKey = keyPrefix + key;
		const {
			contentDisposition,
			contentEncoding,
			contentType = 'application/octet-stream',
			metadata,
			onProgress,
		} = uploadDataOptions ?? {};

		const { ETag: eTag, VersionId: versionId } = await putObject(
			{
				...s3Config,
				abortSignal,
				onUploadProgress: onProgress,
				userAgentValue: getStorageUserAgentValue(StorageAction.UploadData),
			},
			{
				Bucket: bucket,
				Key: finalKey,
				Body: data,
				ContentType: contentType,
				ContentDisposition: contentDisposition,
				ContentEncoding: contentEncoding,
				Metadata: metadata,
				ContentMD5: isObjectLockEnabled
					? await calculateContentMd5(data)
					: undefined,
			}
		);

		return {
			key,
			eTag,
			versionId,
			contentType,
			metadata,
			size: totalLength,
		};
	};
