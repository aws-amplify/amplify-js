// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AWSCredentials,
	StorageAction,
} from '@aws-amplify/core/internals/utils';

import { UploadDataInput, UploadDataWithPathInput } from '../../types';
import {
	calculateContentMd5,
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../utils';
import { ItemWithKey, ItemWithPath } from '../../types/outputs';
import { putObject } from '../../utils/client';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { STORAGE_INPUT_KEY } from '../../utils/constants';
import { S3LibraryOptions, S3ServiceOptions } from '../../types/options';

interface PutObjectJobProps {
	uploadDataInput: UploadDataInput | UploadDataWithPathInput;
	abortSignal: AbortSignal;
	credentialsProvider(): Promise<AWSCredentials>;
	identityIdProvider(): Promise<string>;
	serviceOptions: S3ServiceOptions;
	libraryOptions: S3LibraryOptions;
	totalLength?: number;
}

/**
 * Get a function the returns a promise to call putObject API to S3.
 *
 * @internal
 */
export const putObjectJob =
	({
		uploadDataInput,
		abortSignal,
		credentialsProvider,
		identityIdProvider,
		serviceOptions,
		libraryOptions,
		totalLength,
	}: PutObjectJobProps) =>
	async (): Promise<ItemWithKey | ItemWithPath> => {
		const { options: uploadDataOptions, data } = uploadDataInput;

		const { bucket, keyPrefix, s3Config, isObjectLockEnabled, identityId } =
			await resolveS3ConfigAndInput({
				credentialsProvider,
				identityIdProvider,
				serviceOptions,
				libraryOptions,
				apiOptions: uploadDataOptions,
			});
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
