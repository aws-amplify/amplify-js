// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDataChunker, PartToUpload } from './getDataChunker';
import { S3UploadDataResult, S3UploadOptions } from '../../types';
import { createUploadTask, resolveS3ConfigAndInput } from '../../utils';
import {
	uploadPart,
	abortMultipartUpload,
	completeMultipartUpload,
	Part,
} from '../../../../AwsClients/S3';
import {
	StorageUploadDataRequest,
	DownloadTask,
	TransferProgressEvent,
} from '../../../../types';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { S3Item } from '../../types/results';
import {
	DEFAULT_PART_SIZE,
	MAX_OBJECT_SIZE,
	DEFAULT_QUEUE_SIZE,
} from '../../utils/constants';
import { loadOrCreateMultipartUpload } from './initiateMultipartUpload';
import { ResolvedS3Config } from '../../types/options';
import { byteLength, partByteLength } from './byteLength';
import { getConcurrentUploadsProgressTracker } from './progressTracker';
import { putObjectJob } from './putObjectJob';
import { isCancelError } from '../../../../AwsClients/S3/runtime';
import { getUploadsCacheKey, removeCachedUpload } from './cache';

// Create closure hiding the multipart upload implementation details.
const multipartUploadImpl = (
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
				accessLevel: accessLevel!, // TODO: resolve accessLevel
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
							accessLevel: uploadDataOptions?.accessLevel!, // TODO: resolve accessLevel
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
					Parts: inProgressUpload.completedParts,
				},
			}
		);

		return {
			key: finalKey,
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

/**
 * Upload data to specified S3 object. By default, it uses single PUT operation to upload if the data is less than 5MB.
 * Otherwise, it uses multipart upload to upload the data.
 *
 * @param {StorageUploadDataRequest<S3UploadOptions>} uploadDataRequest The parameters that are passed to the
 * 	uploadData operation.
 * @returns {DownloadTask<S3UploadDataResult>} Cancelable and Resumable task exposing result promise from `result`
 * 	property.
 * @throws service: {@link S3Exception} - thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors
 * thrown either username or key are not defined.
 *
 * TODO: add config errors
 */
export const uploadData = (
	uploadDataRequest: StorageUploadDataRequest<S3UploadOptions>
): DownloadTask<S3UploadDataResult> => {
	const { data } = uploadDataRequest;

	const dataByteLength = byteLength(data);
	assertValidationError(
		dataByteLength === undefined || dataByteLength > MAX_OBJECT_SIZE,
		StorageValidationErrorCode.ObjectTooLarge
	);

	if (dataByteLength && dataByteLength <= DEFAULT_PART_SIZE) {
		const abortController = new AbortController();
		return createUploadTask({
			isMultipartUpload: false,
			job: putObjectJob(
				uploadDataRequest,
				abortController.signal,
				dataByteLength
			),
			onCancel: (abortErrorOverwrite?: Error) => {
				abortController.abort(abortErrorOverwrite);
			},
			// abortController,
		});
	} else {
		const { multipartUploadJob, onPause, onResume, onCancel } =
			multipartUploadImpl(uploadDataRequest, dataByteLength);
		return createUploadTask({
			isMultipartUpload: true,
			job: multipartUploadJob,
			onCancel: (abortErrorOverwrite?: Error) => {
				onCancel(abortErrorOverwrite);
			},
			// abortController,
			onPause,
			onResume,
		});
	}
};

type UploadPartExecutorOptions = {
	dataChunkerGenerator: Generator<PartToUpload, void, undefined>;
	completedPartNumberSet: Set<number>;
	s3Config: ResolvedS3Config;
	abortSignal: AbortSignal;
	bucket: string;
	finalKey: string;
	uploadId: string;
	onPartUploadCompletion: (partNumber: number, eTag: string) => void;
	onProgress?: (event: TransferProgressEvent) => void;
};
const uploadPartExecutor = async ({
	dataChunkerGenerator,
	completedPartNumberSet,
	s3Config,
	abortSignal,
	bucket,
	finalKey,
	uploadId,
	onPartUploadCompletion,
	onProgress,
}: UploadPartExecutorOptions) => {
	let transferredBytes = 0;
	for (const chunkToUpload of dataChunkerGenerator) {
		if (abortSignal.aborted) {
			// TODO: debug message: upload executor aborted
			break;
		}
		const { data, partNumber } = chunkToUpload;
		const partSize = partByteLength(data);
		if (completedPartNumberSet.has(partNumber)) {
			// TODO: debug message: part already uploaded
		} else {
			// handle cancel error
			const { ETag: eTag } = await uploadPart(
				{
					...s3Config,
					abortSignal,
					onUploadProgress: (event: TransferProgressEvent) => {
						const { transferredBytes: currentPartTransferredBytes } = event;
						onProgress?.({
							transferredBytes: transferredBytes + currentPartTransferredBytes,
						});
					},
				},
				{
					Bucket: bucket,
					Key: finalKey,
					UploadId: uploadId,
					// TODO: The Body type of S3 UploadPart API from AWS SDK does not correctly reflects the supported data types.
					Body: data as any,
					PartNumber: partNumber,
					// TODO: Support object lock for multipart upload.
				}
			);
			// eTag will always be set even the S3 model interface marks it as optional.
			onPartUploadCompletion(partNumber, eTag!);
		}

		transferredBytes += partSize;
		onProgress?.({
			transferredBytes,
		});
	}
};
