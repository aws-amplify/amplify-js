// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { UploadDataInput } from '../../../types';
// TODO: Remove this interface when we move to public advanced APIs.
import { UploadDataInput as UploadDataWithPathInputWithAdvancedOptions } from '../../../../../internals/types/inputs';
import {
	calculateContentMd5,
	resolveS3ConfigAndInput,
	validateBucketOwnerID,
	validateStorageOperationInput,
} from '../../../utils';
import { ItemWithKey, ItemWithPath } from '../../../types/outputs';
import { putObject } from '../../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../../utils/userAgent';
import {
	CHECKSUM_ALGORITHM_CRC32,
	STORAGE_INPUT_KEY,
} from '../../../utils/constants';
import { calculateContentCRC32 } from '../../../utils/crc32';
import { constructContentDisposition } from '../../../utils/constructContentDisposition';

/**
 * The input interface for UploadData API with only the options needed for single part upload.
 * It supports both legacy Gen 1 input with key and Gen2 input with path. It also support additional
 * advanced options for StorageBrowser.
 *
 * @internal
 */
export type SinglePartUploadDataInput =
	| UploadDataInput
	| UploadDataWithPathInputWithAdvancedOptions;

/**
 * Get a function the returns a promise to call putObject API to S3.
 *
 * @internal
 */
export const putObjectJob =
	(
		uploadDataInput: SinglePartUploadDataInput,
		abortSignal: AbortSignal,
		totalLength: number,
	) =>
	async (): Promise<ItemWithKey | ItemWithPath> => {
		const { options: uploadDataOptions, data } = uploadDataInput;
		const { bucket, keyPrefix, s3Config, isObjectLockEnabled, identityId } =
			await resolveS3ConfigAndInput(Amplify, uploadDataInput);
		const { inputType, objectKey } = validateStorageOperationInput(
			uploadDataInput,
			identityId,
		);
		validateBucketOwnerID(uploadDataOptions?.expectedBucketOwner);

		const finalKey =
			inputType === STORAGE_INPUT_KEY ? keyPrefix + objectKey : objectKey;
		const {
			contentDisposition,
			contentEncoding,
			contentType = 'application/octet-stream',
			preventOverwrite,
			metadata,
			checksumAlgorithm,
			onProgress,
			expectedBucketOwner,
		} = uploadDataOptions ?? {};

		const checksumCRC32 =
			checksumAlgorithm === CHECKSUM_ALGORITHM_CRC32
				? await calculateContentCRC32(data)
				: undefined;

		const contentMD5 =
			// check if checksum exists. ex: should not exist in react native
			!checksumCRC32 && isObjectLockEnabled
				? await calculateContentMd5(data)
				: undefined;

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
				ExpectedBucketOwner: expectedBucketOwner,
				IfNoneMatch: preventOverwrite ? '*' : undefined,
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
