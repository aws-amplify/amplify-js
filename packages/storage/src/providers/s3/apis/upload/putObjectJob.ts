// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { UploadInput } from '../../types';
import { calculateContentMd5, resolveS3ConfigAndInput } from '../../utils';
import { Item as S3Item } from '../../types/outputs';
import { putObject } from '../../utils/client';

/**
 * Get a function the returns a promise to call putObject API to S3.
 *
 * @internal
 */
export const putObjectJob =
	(
		{ options: uploadOptions, key, data }: UploadInput,
		abortSignal: AbortSignal,
		totalLength?: number
	) =>
	async (): Promise<S3Item> => {
		const { bucket, keyPrefix, s3Config, isObjectLockEnabled } =
			await resolveS3ConfigAndInput(Amplify, uploadOptions);

		// TODO[AllanZhengYP]: support excludeSubPaths option to exclude sub paths
		const finalKey = keyPrefix + key;
		const {
			contentDisposition,
			contentEncoding,
			contentType = 'application/octet-stream',
			metadata,
			onProgress,
		} = uploadOptions ?? {};

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
