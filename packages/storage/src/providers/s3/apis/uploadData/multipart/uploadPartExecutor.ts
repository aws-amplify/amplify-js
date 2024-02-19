// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TransferProgressEvent } from '../../../../../types';
import { ResolvedS3Config } from '../../../types/options';
import { calculateContentMd5 } from '../../../utils';
import { uploadPart } from '../../../utils/client';
import { logger } from '../../../../../utils';

import { PartToUpload } from './getDataChunker';

interface UploadPartExecutorOptions {
	dataChunkerGenerator: Generator<PartToUpload, void, undefined>;
	completedPartNumberSet: Set<number>;
	s3Config: ResolvedS3Config;
	abortSignal: AbortSignal;
	bucket: string;
	finalKey: string;
	uploadId: string;
	isObjectLockEnabled?: boolean;
	onPartUploadCompletion(partNumber: number, eTag: string): void;
	onProgress?(event: TransferProgressEvent): void;
}

export const uploadPartExecutor = async ({
	dataChunkerGenerator,
	completedPartNumberSet,
	s3Config,
	abortSignal,
	bucket,
	finalKey,
	uploadId,
	onPartUploadCompletion,
	onProgress,
	isObjectLockEnabled,
}: UploadPartExecutorOptions) => {
	let transferredBytes = 0;
	for (const { data, partNumber, size } of dataChunkerGenerator) {
		if (abortSignal.aborted) {
			logger.debug('upload executor aborted.');
			break;
		}

		if (completedPartNumberSet.has(partNumber)) {
			logger.debug(`part ${partNumber} already uploaded.`);
			transferredBytes += size;
			onProgress?.({
				transferredBytes,
			});
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
					Body: data,
					PartNumber: partNumber,
					ContentMD5: isObjectLockEnabled
						? await calculateContentMd5(data)
						: undefined,
				},
			);
			transferredBytes += size;
			// eTag will always be set even the S3 model interface marks it as optional.
			onPartUploadCompletion(partNumber, eTag!);
		}
	}
};
