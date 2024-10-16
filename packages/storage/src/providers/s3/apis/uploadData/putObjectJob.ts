// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { UploadDataInput, UploadDataWithPathInput } from '../../types';
import {
	calculateContentMd5,
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../utils';
import { ItemWithKey, ItemWithPath } from '../../types/outputs';
import { putObject } from '../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { STORAGE_INPUT_KEY } from '../../utils/constants';
import { calculateContentCRC32 } from '../../utils/crc32';
import { constructContentDisposition } from '../../utils/constructContentDisposition';

import { validateObjectNotExists } from './validateObjectNotExists';

/**
 * Get a function the returns a promise to call putObject API to S3.
 *
 * @internal
 */
export const putObjectJob =
	(
		uploadDataInput: UploadDataInput | UploadDataWithPathInput,
		abortSignal: AbortSignal,
		totalLength?: number,
	) =>
	async (): Promise<ItemWithKey | ItemWithPath> => {
		const { options: uploadDataOptions, data } = uploadDataInput;
		const { bucket, keyPrefix, s3Config, isObjectLockEnabled, identityId } =
			await resolveS3ConfigAndInput(Amplify, uploadDataInput);
		const { inputType, objectKey } = validateStorageOperationInput(
			uploadDataInput,
			identityId,
		);

		const finalKey =
			inputType === STORAGE_INPUT_KEY ? keyPrefix + objectKey : objectKey;
		const {
			contentDisposition,
			contentEncoding,
			contentType = 'application/octet-stream',
			preventOverwrite,
			metadata,
			onProgress,
		} = uploadDataOptions ?? {};

		const checksumCRC32 = await calculateContentCRC32(data);
		const contentMD5 =
			// check if checksum exists. ex: should not exist in react native
			!checksumCRC32 && isObjectLockEnabled
				? await calculateContentMd5(data)
				: undefined;

		if (preventOverwrite) {
			await validateObjectNotExists(s3Config, {
				Bucket: bucket,
				Key: finalKey,
			});
		}

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
				ContentDisposition: constructContentDisposition(contentDisposition),
				ContentEncoding: contentEncoding,
				Metadata: metadata,
				ContentMD5: contentMD5,
				ChecksumCRC32: checksumCRC32?.checksum,
			},
		);

		const result = {
			eTag,
			versionId,
			contentType,
			metadata,
			size: totalLength,
		};

		return inputType === STORAGE_INPUT_KEY
			? { key: objectKey, ...result }
			: { path: objectKey, ...result };
	};
