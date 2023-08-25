// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PartToUpload } from './getDataChunker';
import { uploadPart } from '../../../../../AwsClients/S3';
import { TransferProgressEvent } from '../../../../../types';
import { ResolvedS3Config } from '../../../types/options';
import { partByteLength } from './partByteLength';
import { calculateContentMd5 } from '../../../utils';

type UploadPartExecutorOptions = {
	dataChunkerGenerator: Generator<PartToUpload, void, undefined>;
	completedPartNumberSet: Set<number>;
	s3Config: ResolvedS3Config;
	abortSignal: AbortSignal;
	bucket: string;
	finalKey: string;
	uploadId: string;
	isObjectLockEnabled?: boolean;
	onPartUploadCompletion: (partNumber: number, eTag: string) => void;
	onProgress?: (event: TransferProgressEvent) => void;
};

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
	for (const { data, partNumber } of dataChunkerGenerator) {
		if (abortSignal.aborted) {
			// TODO: debug message: upload executor aborted
			break;
		}

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
					ContentMD5: isObjectLockEnabled
						? await calculateContentMd5(data)
						: undefined,
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
