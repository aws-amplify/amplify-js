// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDataChunker } from './getDataChunker';
import { S3UploadOptions } from '../../../types';
import { resolveS3ConfigAndInput } from '../../../utils';
import {
	abortMultipartUpload,
	completeMultipartUpload,
	headObject,
	Part,
} from '../../../../../AwsClients/S3';
import { StorageUploadDataRequest } from '../../../../../types';
import { S3Item } from '../../../types/results';
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
import { AmplifyV6, StorageAccessLevel } from '@aws-amplify/core';

// Create closure hiding the multipart upload implementation details.
export const getMultipartUploadHandlers = (
	{
		options: uploadDataOptions,
		key,
		data,
	}: StorageUploadDataRequest<S3UploadOptions>,
	totalLength?: number
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

	const startUpload = async (): Promise<S3Item> => {
		const resolvedS3Options = await resolveS3ConfigAndInput(uploadDataOptions);
		s3Config = resolvedS3Options.s3Config;
		bucket = resolvedS3Options.bucket;
		keyPrefix = resolvedS3Options.keyPrefix;

		abortController = new AbortController();

		const {
			contentDisposition,
			contentEncoding,
			contentType,
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
				totalLength,
				abortSignal: abortController.signal,
			});
			inProgressUpload = {
				uploadId,
				completedParts: cachedParts,
			};
		}

		// TODO[AllanZhengYP]: support excludeSubPaths option to exclude sub paths
		const finalKey = keyPrefix + key;

		const abortListener = async () => {
			try {
				if (abortController?.signal.reason === pauseUploadError) {
					return;
				}
				await abortMultipartUpload(s3Config!, {
					Bucket: bucket,
					Key: finalKey,
					UploadId: inProgressUpload?.uploadId,
				});
				if (totalLength) {
					removeCachedUpload(
						getUploadsCacheKey({
							file: data instanceof File ? data : undefined,
							accessLevel: resolveAccessLevel(uploadDataOptions?.accessLevel),
							contentType: uploadDataOptions?.contentType,
							bucket: bucket!,
							size: totalLength,
							key,
						})
					);
				}
			} catch (e) {
				// TODO: debug message: Error cancelling upload task.
			} finally {
				abortController?.signal.removeEventListener('abort', abortListener);
			}
		};
		abortController?.signal.addEventListener('abort', abortListener);

		const dataChunker = getDataChunker(data, totalLength);
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
				totalLength,
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
		// handle cancel error
		await Promise.all(concurrentUploadPartExecutors);

		const { ETag: eTag } = await completeMultipartUpload(
			{
				...s3Config,
				abortSignal: abortController.signal,
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

		if (totalLength) {
			const { ContentLength: uploadedObjectLength } = await headObject(
				s3Config,
				{
					Bucket: bucket,
					Key: finalKey,
				}
			);
			if (uploadedObjectLength && uploadedObjectLength !== totalLength) {
				throw new StorageError({
					name: 'Error',
					message: `Upload failed. Expected object size ${totalLength}, but got ${uploadedObjectLength}.`,
				});
			}
		}

		return {
			key,
			eTag,
			contentType,
			metadata,
		};
	};

	// Special abort error that differentiates HTTP requests cancellation caused by pause() from ones caused by cancel().
	// The former one should NOT cause the upload job to throw, but cancels any pending HTTP requests.
	const pauseUploadError = new Error('Upload paused');
	const startUploadWithResumability = () =>
		startUpload()
			.then(resolveCallback)
			.catch(error => {
				const abortSignal = abortController?.signal;
				if (abortSignal?.aborted && abortSignal?.reason === pauseUploadError) {
					// TODO: debug message: upload paused
				} else {
					// TODO: debug message: upload cancelled
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
		abortController?.abort(pauseUploadError);
	};
	const onResume = () => {
		startUploadWithResumability();
	};
	const onCancel = (abortErrorOverwrite?: Error) => {
		abortController?.abort(abortErrorOverwrite);
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
	AmplifyV6.libraryOptions.Storage?.AWSS3?.defaultAccessLevel ??
	DEFAULT_ACCESS_LEVEL;
