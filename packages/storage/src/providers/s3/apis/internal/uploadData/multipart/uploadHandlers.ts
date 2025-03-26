// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	KeyValueStorageInterface,
	StorageAccessLevel,
} from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { UploadDataInput } from '../../../../types';
// TODO: Remove this interface when we move to public advanced APIs.
import { UploadDataInput as UploadDataWithPathInputWithAdvancedOptions } from '../../../../../../internals/types/inputs';
import {
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../../../utils';
import { ItemWithKey, ItemWithPath } from '../../../../types/outputs';
import {
	DEFAULT_ACCESS_LEVEL,
	DEFAULT_QUEUE_SIZE,
	STORAGE_INPUT_KEY,
} from '../../../../utils/constants';
import {
	ResolvedS3Config,
	UploadDataWithKeyOptions,
} from '../../../../types/options';
import { StorageError } from '../../../../../../errors/StorageError';
import { CanceledError } from '../../../../../../errors/CanceledError';
import {
	Part,
	abortMultipartUpload,
	completeMultipartUpload,
	headObject,
} from '../../../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../../../utils/userAgent';
import { logger } from '../../../../../../utils';
import { calculateContentCRC32 } from '../../../../utils/crc32';
import { StorageOperationOptionsInput } from '../../../../../../types/inputs';
import { IntegrityError } from '../../../../../../errors/IntegrityError';

import { uploadPartExecutor } from './uploadPartExecutor';
import {
	getUploadsCacheKey,
	removeCachedUpload,
	serializeUploadOptions,
} from './uploadCache';
import { getConcurrentUploadsProgressTracker } from './progressTracker';
import { loadOrCreateMultipartUpload } from './initialUpload';
import { getDataChunker } from './getDataChunker';
import { calculatePartSize } from './calculatePartSize';

type WithResumableCacheConfig<Input extends StorageOperationOptionsInput<any>> =
	Input & {
		options?: Input['options'] & {
			/**
			 * The cache instance to store the in-progress multipart uploads so they can be resumed
			 * after page refresh. By default the library caches the uploaded file name,
			 * last modified, final checksum, size, bucket, key, and corresponded in-progress
			 * multipart upload ID from S3. If the library detects the same input corresponds to a
			 * previously in-progress upload from within 1 hour ago, it will continue
			 * the upload from where it left.
			 *
			 * By default, this option is not set. The upload caching is disabled.
			 */
			resumableUploadsCache?: KeyValueStorageInterface;
		};
	};

/**
 * The input interface for UploadData API with the options needed for multi-part upload.
 * It supports both legacy Gen 1 input with key and Gen2 input with path. It also support additional
 * advanced options for StorageBrowser.
 *
 * @internal
 */
export type MultipartUploadDataInput = WithResumableCacheConfig<
	UploadDataInput | UploadDataWithPathInputWithAdvancedOptions
>;

/**
 * Create closure hiding the multipart upload implementation details and expose the upload job and control functions(
 * onPause, onResume, onCancel).
 *
 * @internal
 */
export const getMultipartUploadHandlers = (
	uploadDataInput: MultipartUploadDataInput,
	size: number,
) => {
	let resolveCallback:
		| ((value: ItemWithKey | ItemWithPath) => void)
		| undefined;
	let rejectCallback: ((reason?: any) => void) | undefined;
	let inProgressUpload:
		| {
				uploadId: string;
				completedParts: Part[];
				finalCrc32?: string;
		  }
		| undefined;
	let resolvedS3Config: ResolvedS3Config | undefined;
	let abortController: AbortController | undefined;
	let resolvedAccessLevel: StorageAccessLevel | undefined;
	let resolvedBucket: string | undefined;
	let resolvedKeyPrefix: string | undefined;
	let resolvedIdentityId: string | undefined;
	let uploadCacheKey: string | undefined;
	let finalKey: string;
	let expectedBucketOwner: string | undefined;
	// Special flag that differentiates HTTP requests abort error caused by pause() from ones caused by cancel().
	// The former one should NOT cause the upload job to throw, but cancels any pending HTTP requests.
	// This should be replaced by a special abort reason. However,the support of this API is lagged behind.
	let isAbortSignalFromPause = false;

	const { resumableUploadsCache } = uploadDataInput.options ?? {};

	const startUpload = async (): Promise<ItemWithKey | ItemWithPath> => {
		const { options: uploadDataOptions, data } = uploadDataInput;
		const resolvedS3Options = await resolveS3ConfigAndInput(
			Amplify,
			uploadDataInput,
		);

		abortController = new AbortController();
		isAbortSignalFromPause = false;
		resolvedS3Config = resolvedS3Options.s3Config;
		resolvedBucket = resolvedS3Options.bucket;
		resolvedIdentityId = resolvedS3Options.identityId;
		expectedBucketOwner = uploadDataOptions?.expectedBucketOwner;

		const { inputType, objectKey } = validateStorageOperationInput(
			uploadDataInput,
			resolvedIdentityId,
		);

		const {
			contentDisposition,
			contentEncoding,
			contentType = 'application/octet-stream',
			metadata,
			preventOverwrite,
			onProgress,
		} = uploadDataOptions ?? {};

		finalKey = objectKey;

		// Resolve "key" specific options
		if (inputType === STORAGE_INPUT_KEY) {
			const accessLevel = (uploadDataOptions as UploadDataWithKeyOptions)
				?.accessLevel;

			resolvedKeyPrefix = resolvedS3Options.keyPrefix;
			finalKey = resolvedKeyPrefix + objectKey;
			resolvedAccessLevel = resolveAccessLevel(accessLevel);
		}

		const { checksum: optionsHash } = await calculateContentCRC32(
			serializeUploadOptions(uploadDataOptions),
		);

		if (!inProgressUpload) {
			const { uploadId, cachedParts, finalCrc32 } =
				await loadOrCreateMultipartUpload({
					s3Config: resolvedS3Config,
					accessLevel: resolvedAccessLevel,
					bucket: resolvedBucket,
					keyPrefix: resolvedKeyPrefix,
					key: objectKey,
					contentType,
					contentDisposition,
					contentEncoding,
					metadata,
					data,
					size,
					abortSignal: abortController.signal,
					checksumAlgorithm: uploadDataOptions?.checksumAlgorithm,
					optionsHash,
					resumableUploadsCache,
					expectedBucketOwner,
				});
			inProgressUpload = {
				uploadId,
				completedParts: cachedParts,
				finalCrc32,
			};
		}

		uploadCacheKey = size
			? getUploadsCacheKey({
					file: data instanceof File ? data : undefined,
					accessLevel: resolvedAccessLevel,
					contentType: uploadDataOptions?.contentType,
					bucket: resolvedBucket!,
					size,
					key: objectKey,
					optionsHash,
				})
			: undefined;

		const dataChunker = getDataChunker(data, size);
		const completedPartNumberSet = new Set<number>(
			inProgressUpload.completedParts.map(({ PartNumber }) => PartNumber!),
		);
		const onPartUploadCompletion = (
			partNumber: number,
			eTag: string,
			crc32: string | undefined,
		) => {
			inProgressUpload?.completedParts.push({
				PartNumber: partNumber,
				ETag: eTag,
				// TODO: crc32 can always be added once RN also has an implementation
				...(crc32 ? { ChecksumCRC32: crc32 } : {}),
			});
		};
		const concurrentUploadsProgressTracker =
			getConcurrentUploadsProgressTracker({
				size,
				onProgress,
			});

		const concurrentUploadPartExecutors: Promise<void>[] = [];
		for (let index = 0; index < DEFAULT_QUEUE_SIZE; index++) {
			concurrentUploadPartExecutors.push(
				uploadPartExecutor({
					dataChunkerGenerator: dataChunker,
					completedPartNumberSet,
					s3Config: resolvedS3Config,
					abortSignal: abortController.signal,
					bucket: resolvedBucket,
					finalKey,
					uploadId: inProgressUpload.uploadId,
					onPartUploadCompletion,
					onProgress: concurrentUploadsProgressTracker.getOnProgressListener(),
					isObjectLockEnabled: resolvedS3Options.isObjectLockEnabled,
					useCRC32Checksum: Boolean(inProgressUpload.finalCrc32),
					expectedBucketOwner,
				}),
			);
		}

		await Promise.all(concurrentUploadPartExecutors);

		validateCompletedParts(inProgressUpload.completedParts, size);

		const { ETag: eTag } = await completeMultipartUpload(
			{
				...resolvedS3Config,
				abortSignal: abortController.signal,
				userAgentValue: getStorageUserAgentValue(StorageAction.UploadData),
			},
			{
				Bucket: resolvedBucket,
				Key: finalKey,
				UploadId: inProgressUpload.uploadId,
				ChecksumCRC32: inProgressUpload.finalCrc32,
				IfNoneMatch: preventOverwrite ? '*' : undefined,
				MultipartUpload: {
					Parts: sortUploadParts(inProgressUpload.completedParts),
				},
				ExpectedBucketOwner: expectedBucketOwner,
			},
		);

		if (size) {
			const { ContentLength: uploadedObjectSize, $metadata } = await headObject(
				resolvedS3Config,
				{
					Bucket: resolvedBucket,
					Key: finalKey,
					ExpectedBucketOwner: expectedBucketOwner,
				},
			);
			if (uploadedObjectSize && uploadedObjectSize !== size) {
				throw new StorageError({
					name: 'Error',
					message: `Upload failed. Expected object size ${size}, but got ${uploadedObjectSize}.`,
					metadata: $metadata,
				});
			}
		}

		if (resumableUploadsCache && uploadCacheKey) {
			await removeCachedUpload(resumableUploadsCache, uploadCacheKey);
		}

		const result = {
			eTag,
			contentType,
			metadata,
		};

		return inputType === STORAGE_INPUT_KEY
			? { key: objectKey, ...result }
			: { path: objectKey, ...result };
	};

	const startUploadWithResumability = () =>
		startUpload()
			.then(resolveCallback)
			.catch(error => {
				const abortSignal = abortController?.signal;
				if (abortSignal?.aborted && isAbortSignalFromPause) {
					logger.debug('upload paused.');
				} else {
					// Uncaught errors should be exposed to the users.
					rejectCallback!(error);
				}
			});

	const multipartUploadJob = () =>
		new Promise<ItemWithKey | ItemWithPath>((resolve, reject) => {
			resolveCallback = resolve;
			rejectCallback = reject;
			startUploadWithResumability();
		});
	const onPause = () => {
		isAbortSignalFromPause = true;
		abortController?.abort();
	};
	const onResume = () => {
		startUploadWithResumability();
	};
	const onCancel = (message?: string) => {
		// 1. abort in-flight API requests
		abortController?.abort(message);

		const cancelUpload = async () => {
			// 2. clear upload cache.
			if (uploadCacheKey && resumableUploadsCache) {
				await removeCachedUpload(resumableUploadsCache, uploadCacheKey);
			}
			// 3. clear multipart upload on server side.
			await abortMultipartUpload(resolvedS3Config!, {
				Bucket: resolvedBucket,
				Key: finalKey,
				UploadId: inProgressUpload?.uploadId,
				ExpectedBucketOwner: expectedBucketOwner,
			});
		};
		cancelUpload().catch(e => {
			logger.debug('error when cancelling upload task.', e);
		});

		rejectCallback!(
			// Internal error that should not be exposed to the users. They should use isCancelError() to check if
			// the error is caused by cancel().
			new CanceledError(message ? { message } : undefined),
		);
	};

	return {
		multipartUploadJob,
		onPause,
		onResume,
		onCancel,
	};
};

const resolveAccessLevel = (accessLevel?: StorageAccessLevel) =>
	accessLevel ??
	Amplify.libraryOptions.Storage?.S3?.defaultAccessLevel ??
	DEFAULT_ACCESS_LEVEL;

const validateCompletedParts = (completedParts: Part[], size: number) => {
	const partsExpected = Math.ceil(size / calculatePartSize(size));
	const validPartCount = completedParts.length === partsExpected;

	const sorted = sortUploadParts(completedParts);
	const validPartNumbers = sorted.every(
		(part, index) => part.PartNumber === index + 1,
	);

	if (!validPartCount || !validPartNumbers) {
		throw new IntegrityError();
	}
};

const sortUploadParts = (parts: Part[]) => {
	return [...parts].sort(
		(partA, partB) => partA.PartNumber! - partB.PartNumber!,
	);
};
