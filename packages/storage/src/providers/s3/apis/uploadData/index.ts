// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDataChunker, PartToUpload } from './getDataChunker';
import { S3UploadDataResult, S3UploadOptions } from '../../types';
import { createUploadTask, resolveS3ConfigAndInput } from '../../utils';
import {
	putObject,
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
import { calculateContentMd5 } from '../../../../common/MD5utils'; // TODO[AllanZhengYP]: move to utils
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '../../../../errors/types/validation';
import { StorageError } from '../../../../errors/StorageError';
import { S3Item } from '../../types/results';
import {
	DEFAULT_PART_SIZE,
	MAX_OBJECT_SIZE,
	DEFAULT_QUEUE_SIZE,
} from '../../utils/constants';
import { initMultipartUpload } from './initiateMultipartUpload';
import { ResolvedS3Config } from '../../types/options';
import { byteLength, partByteLength } from './byteLength';
import { getConcurrentUploadsProgressTracker } from './progressTracker';

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
	const { key, data, options } = uploadDataRequest;

	const dataByteLength = byteLength(data);
	assertValidationError(
		!!dataByteLength && dataByteLength <= MAX_OBJECT_SIZE,
		StorageValidationErrorCode.ObjectTooLarge
	);

	const abortController = new AbortController();
	if (dataByteLength <= DEFAULT_PART_SIZE) {
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
			abortController,
		});
	} else {
		return createUploadTask({
			isMultipartUpload: true,
			job: multipartUploadJob(
				uploadDataRequest,
				abortController.signal,
				dataByteLength
			),
			onCancel: (abortErrorOverwrite?: Error) => {
				abortController.abort(abortErrorOverwrite);
			},
			abortController,
			onPause,
			onResume,
		});
	}
};

const putObjectJob =
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
					? await calculateContentMd5(data as any) // TODO[AllanZhengYP]: calculate md5 for ArrayBuffer
					: undefined,
			}
		);

		return {
			key: finalKey,
			eTag,
			versionId,
			contentType,
			metadata,
			size: totalLength,
		};
	};

const multipartUploadJob =
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
		const { bucket, keyPrefix, s3Config } = await resolveS3ConfigAndInput(
			uploadDataOptions
		);
		const {
			contentDisposition,
			contentEncoding,
			contentType,
			metadata,
			onProgress,
			accessLevel,
		} = uploadDataOptions ?? {};

		const { uploadId, cachedParts } = await initMultipartUpload({
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
			abortSignal,
		});

		// TODO[AllanZhengYP]: support excludeSubPaths option to exclude sub paths
		const finalKey = keyPrefix + key;

		const abortListener = async () => {
			try {
				await abortMultipartUpload(s3Config, {
					Bucket: bucket,
					Key: finalKey,
					UploadId: uploadId,
				});
			} finally {
				abortSignal?.removeEventListener('abort', abortListener);
			}
		};
		abortSignal?.addEventListener('abort', abortListener);

		const dataChunker = getDataChunker(data);
		const uploadedPartNumberSet = new Set<number>(
			cachedParts.map(({ PartNumber }) => PartNumber!)
		);
		const uploadedPartsSinceLastUpload: Part[] = [];
		const onPartUploadCompleted = (partNumber: number, eTag: string) => {
			uploadedPartsSinceLastUpload.push({
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
					uploadedPartNumberSet,
					s3Config,
					abortSignal,
					bucket,
					finalKey,
					uploadId,
					onPartUploadCompleted,
					onProgress: concurrentUploadsProgressTracker.getOnProgressListener(),
				})
			);
		}
		// handle cancel error
		await Promise.all(concurrentUploadPartExecutors);

		const completedParts = cachedParts.concat(uploadedPartsSinceLastUpload);
		const { ETag: eTag } = await completeMultipartUpload(
			{
				...s3Config,
				abortSignal,
			},
			{
				Bucket: bucket,
				Key: finalKey,
				UploadId: uploadId,
				MultipartUpload: {
					Parts: completedParts,
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

type UploadPartExecutorOptions = {
	dataChunkerGenerator: Generator<PartToUpload, void, undefined>;
	uploadedPartNumberSet: Set<number>;
	s3Config: ResolvedS3Config;
	abortSignal: AbortSignal;
	bucket: string;
	finalKey: string;
	uploadId: string;
	onPartUploadCompleted: (partNumber: number, eTag: string) => void;
	onProgress?: (event: TransferProgressEvent) => void;
};
const uploadPartExecutor = async ({
	dataChunkerGenerator,
	uploadedPartNumberSet,
	s3Config,
	abortSignal,
	bucket,
	finalKey,
	uploadId,
	onPartUploadCompleted,
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
		if (uploadedPartNumberSet.has(partNumber)) {
			// TODO: debug message: part already uploaded
		} else {
			// handle cancel error
			const { ETag: eTag } = await uploadPart(
				{
					...s3Config,
					abortSignal,
					onUploadProgress: event => {
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
			onPartUploadCompleted(partNumber, eTag!);
		}

		transferredBytes += partSize;
		onProgress?.({
			transferredBytes,
		});
	}
};
