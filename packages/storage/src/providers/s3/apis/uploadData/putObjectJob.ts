// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { S3UploadOptions } from '../../types';
import { calculateContentMd5, resolveS3ConfigAndInput } from '../../utils';
import { putObject } from '../../../../AwsClients/S3';
import { StorageUploadDataRequest } from '../../../../types';
import { S3Item } from '../../types/results';

export const putObjectJob =
	(
		{
			options: uploadDataOptions,
			key,
			data,
		}: StorageUploadDataRequest<S3UploadOptions>,
		abortSignal: AbortSignal,
		totalLength?: number
	) =>
	async (): Promise<S3Item> => {
		const { bucket, keyPrefix, s3Config, isObjectLockEnabled } =
			await resolveS3ConfigAndInput(uploadDataOptions);

		// TODO[AllanZhengYP]: support excludeSubPaths option to exclude sub paths
		const finalKey = keyPrefix + key;
		const {
			contentDisposition,
			contentEncoding,
			contentType,
			metadata,
			onProgress,
		} = uploadDataOptions ?? {};

		const { ETag: eTag, VersionId: versionId } = await putObject(
			{
				...s3Config,
				abortSignal,
				onUploadProgress: onProgress,
			},
			{
				Bucket: bucket,
				Key: finalKey,
				// TODO: The Body type of S3 PutObject API from AWS SDK does not correctly reflects the supported data types.
				Body: data as any,
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
