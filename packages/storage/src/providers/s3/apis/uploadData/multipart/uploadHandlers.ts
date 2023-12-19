// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, StorageAccessLevel } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { getDataChunker } from './getDataChunker';
import { UploadDataInput } from '../../../types';
import { resolveS3ConfigAndInput } from '../../../utils';
import { Item as S3Item } from '../../../types/outputs';
import {
	DEFAULT_ACCESS_LEVEL,
	DEFAULT_QUEUE_SIZE,
} from '../../../utils/constants';
import { loadOrCreateMultipartUpload } from './initialUpload';
import { ResolvedS3Config } from '../../../types/options';
import { getConcurrentUploadsProgressTracker } from './progressTracker';
import { getUploadsCacheKey, removeCachedUpload } from './uploadCache';
import { uploadPartExecutor } from './uploadPartExecutor';
import { StorageError } from '../../../../../errors/StorageError';
import { CanceledError } from '../../../../../errors/CanceledError';
import {
	Part,
	abortMultipartUpload,
	completeMultipartUpload,
	headObject,
} from '../../../utils/client';
import { getStorageUserAgentValue } from '../../../utils/userAgent';
import { logger } from '../../../../../utils';

/**
 * Create closure hiding the multipart upload implementation details and expose the upload job and control functions(
 * onPause, onResume, onCancel).
 *
 * @internal
 */
export const getMultipartUploadHandlers = (
	{ options: uploadDataOptions, key, data }: UploadDataInput,
	size?: number
) => {
	let resolveCallback: ((value: S3Item) => void) | undefined;
	let rejectCallback: ((reason?: any) => void) | undefined;
	let inProgressUpload:
		| {
				uploadId: string;
				completedParts: Part[];
		  }
		| undefined;
	let s3Config: ResolvedS3Config | undefined;
	let abortController: AbortController | undefined;
	let bucket: string | undefined;
	let keyPrefix: string | undefined;
	let uploadCacheKey: string | undefined;
	// Special flag that differentiates HTTP requests abort error caused by pause() from ones caused by cancel().
	// The former one should NOT cause the upload job to throw, but cancels any pending HTTP requests.
	// This should be replaced by a special abort reason. However,the support of this API is lagged behind.
	let isAbortSignalFromPause: boolean = false;

	const startUpload = async (): Promise<S3Item> => {
		const resolvedS3Options = await resolveS3ConfigAndInput(
			Amplify,
			uploadDataOptions
		);
		s3Config = resolvedS3Options.s3Config;
		bucket = resolvedS3Options.bucket;
		keyPrefix = resolvedS3Options.keyPrefix;

		abortController = new AbortController();
		isAbortSignalFromPause = false;

		const {
			contentDisposition,
			contentEncoding,
			contentType = 'application/octet-stream',
			metadata,
			accessLevel,
			onProgress,
		} = uploadDataOptions ?? {};

		if (!inProgressUpload) {
			const { uploadId, cachedParts } = await loadOrCreateMultipartUpload({
				s3Config,
				accessLevel: resolveAccessLevel(accessLevel),
				bucket,
				keyPrefix,
				key,
				contentType,
				contentDisposition,
				contentEncoding,
				metadata,
				data,
				size,
				abortSignal: abortController.signal,
			});
			inProgressUpload = {
				uploadId,
				completedParts: cachedParts,
			};
		}

		const finalKey = keyPrefix + key;
		uploadCacheKey = size
			? getUploadsCacheKey({
					file: data instanceof File ? data : undefined,
					accessLevel: resolveAccessLevel(uploadDataOptions?.accessLevel),
					contentType: uploadDataOptions?.contentType,
					bucket: bucket!,
					size,
					key,
			  })
			: undefined;

		const dataChunker = getDataChunker(data, size);
		const completedPartNumberSet = new Set<number>(
			inProgressUpload.completedParts.map(({ PartNumber }) => PartNumber!)
		);
		const onPartUploadCompletion = (partNumber: number, eTag: string) => {
			inProgressUpload?.completedParts.push({
				PartNumber: partNumber,
				ETag: eTag,
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
					s3Config,
					abortSignal: abortController.signal,
					bucket,
					finalKey,
					uploadId: inProgressUpload.uploadId,
					onPartUploadCompletion,
					onProgress: concurrentUploadsProgressTracker.getOnProgressListener(),
					isObjectLockEnabled: resolvedS3Options.isObjectLockEnabled,
				})
			);
		}

		await Promise.all(concurrentUploadPartExecutors);

		const { ETag: eTag } = await completeMultipartUpload(
			{
				...s3Config,
				abortSignal: abortController.signal,
				userAgentValue: getStorageUserAgentValue(StorageAction.UploadData),
			},
			{
				Bucket: bucket,
				Key: finalKey,
				UploadId: inProgressUpload.uploadId,
				MultipartUpload: {
					Parts: inProgressUpload.completedParts.sort(
						(partA, partB) => partA.PartNumber! - partB.PartNumber!
					),
				},
			}
		);

		if (size) {
			const { ContentLength: uploadedObjectSize } = await headObject(s3Config, {
				Bucket: bucket,
				Key: finalKey,
			});
			if (uploadedObjectSize && uploadedObjectSize !== size) {
				throw new StorageError({
					name: 'Error',
					message: `Upload failed. Expected object size ${size}, but got ${uploadedObjectSize}.`,
				});
			}
		}

		if (uploadCacheKey) {
			await removeCachedUpload(uploadCacheKey);
		}

		return {
			key,
			eTag,
			contentType,
			metadata,
		};
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
		new Promise<S3Item>((resolve, reject) => {
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
			if (uploadCacheKey) {
				await removeCachedUpload(uploadCacheKey);
			}
			// 3. clear multipart upload on server side.
			await abortMultipartUpload(s3Config!, {
				Bucket: bucket,
				Key: keyPrefix! + key,
				UploadId: inProgressUpload?.uploadId,
			});
		};
		cancelUpload().catch(e => {
			logger.debug('error when cancelling upload task.', e);
		});

		rejectCallback!(
			// Internal error that should not be exposed to the users. They should use isCancelError() to check if
			// the error is caused by cancel().
			new CanceledError(message ? { message } : undefined)
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
