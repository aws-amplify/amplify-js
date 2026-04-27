// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { ServerUploadDataOutput, ServerUploadDataTask } from '../../types';
import {
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../utils';
import {
	abortMultipartUpload,
	completeMultipartUpload,
	createMultipartUpload,
	uploadPart,
} from '../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { STORAGE_INPUT_KEY } from '../../utils/constants';
import { calculateContentCRC32 } from '../../utils/crc32';

const DEFAULT_PART_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_PART_SIZE = 500 * 1024 * 1024; // 500MB
const CONCURRENT_UPLOADS = 25;

export interface ServerUploadStreamInput {
	path: string;
	stream: ReadableStream<Uint8Array>;
	options?: {
		contentType?: string;
		contentLength?: number;
	};
}

export function uploadStream(
	contextSpec: AmplifyServer.ContextSpec,
	input: ServerUploadStreamInput,
): ServerUploadDataTask {
	const amplify = getAmplifyServerContext(contextSpec).amplify;
	const abortController = new AbortController();

	const result = (async (): Promise<ServerUploadDataOutput> => {
		const { s3Config, bucket, keyPrefix, identityId } =
			await resolveS3ConfigAndInput(amplify, input as any);

		const { inputType, objectKey } = validateStorageOperationInput(
			input as any,
			identityId,
		);
		const finalKey =
			inputType === STORAGE_INPUT_KEY ? keyPrefix! + objectKey : objectKey;

		const contentType =
			input.options?.contentType ?? 'application/octet-stream';

		const { UploadId } = await createMultipartUpload(
			{
				...s3Config,
				userAgentValue: getStorageUserAgentValue(StorageAction.UploadData),
			},
			{
				Bucket: bucket,
				Key: finalKey,
				ContentType: contentType,
			},
		);

		console.log(
			`[uploadStream] createMultipartUpload → uploadId: ${UploadId}`,
		);

		// Pick part size: if contentLength is known, size parts so we use ≤1000 parts (with min 5MB, max 100MB)
		const hintedLength = input.options?.contentLength;
		let partSize = DEFAULT_PART_SIZE;
		if (hintedLength && hintedLength > 0) {
			partSize = Math.min(MAX_PART_SIZE, Math.max(DEFAULT_PART_SIZE, Math.ceil(hintedLength / 1000)));
		}
		console.log(`[uploadStream] partSize: ${(partSize / 1024 / 1024).toFixed(0)}MB${hintedLength ? ` (contentLength: ${(hintedLength / 1024 / 1024).toFixed(0)}MB)` : ''}`);

		const completedParts: { PartNumber: number; ETag: string }[] = [];
		let totalBytesRead = 0;
		const startTime = Date.now();

		let aborted = false;
		const inFlight: Promise<void>[] = [];

		try {
			const reader = input.stream.getReader();
			let partNumber = 1;
			let buffer = new Uint8Array(0);

			const doUploadPart = async (
				chunk: Uint8Array,
				pn: number,
			): Promise<void> => {
				if (aborted) return;
				const partStart = Date.now();
				const checksumCRC32 = await calculateContentCRC32(chunk);
				const { ETag } = await uploadPart(
					{
						...s3Config,
						userAgentValue: getStorageUserAgentValue(
							StorageAction.UploadData,
						),
					},
					{
						Bucket: bucket,
						Key: finalKey,
						UploadId,
						PartNumber: pn,
						Body: chunk,
						ChecksumCRC32: checksumCRC32,
					},
				);
				completedParts.push({ PartNumber: pn, ETag: ETag! });
				console.log(
					`[uploadStream] part ${pn} uploaded (${Date.now() - partStart}ms)`,
				);
			};

			while (true) {
				if (abortController.signal.aborted) {
					throw new Error('Upload aborted');
				}

				const { done, value } = await reader.read();

				if (value) {
					totalBytesRead += value.length;
					const merged = new Uint8Array(buffer.length + value.length);
					merged.set(buffer);
					merged.set(value, buffer.length);
					buffer = merged;
				}

				while (buffer.length >= partSize) {
					const chunk = buffer.slice(0, partSize);
					buffer = buffer.slice(partSize);

					// Throttle: wait if we have CONCURRENT_UPLOADS in flight
					if (inFlight.length >= CONCURRENT_UPLOADS) {
						await Promise.race(inFlight);
					}

					const p = doUploadPart(chunk, partNumber).then(() => {
						inFlight.splice(inFlight.indexOf(p), 1);
					});
					inFlight.push(p);

					if (partNumber % 50 === 0) {
						const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
						console.log(
							`[uploadStream] progress: ${partNumber} parts | ${(totalBytesRead / 1024 / 1024).toFixed(0)}MB read | ${elapsed}s elapsed`,
						);
					}
					partNumber++;
				}

				if (done) {
					// Upload remaining buffer as final part
					if (buffer.length > 0) {
						if (inFlight.length >= CONCURRENT_UPLOADS) {
							await Promise.race(inFlight);
						}
						const p = doUploadPart(buffer, partNumber).then(() => {
							inFlight.splice(inFlight.indexOf(p), 1);
						});
						inFlight.push(p);
					}
					// Wait for all in-flight uploads
					await Promise.all(inFlight);
					const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
					console.log(
						`[uploadStream] all ${completedParts.length} parts uploaded | ${(totalBytesRead / 1024 / 1024).toFixed(0)}MB | ${elapsed}s — completing...`,
					);
					break;
				}
			}

			completedParts.sort((a, b) => a.PartNumber - b.PartNumber);

			const { ETag: finalETag } = await completeMultipartUpload(
				{
					...s3Config,
					userAgentValue: getStorageUserAgentValue(StorageAction.UploadData),
				},
				{
					Bucket: bucket,
					Key: finalKey,
					UploadId,
					MultipartUpload: {
						Parts: completedParts.map(p => ({
							PartNumber: p.PartNumber,
							ETag: p.ETag,
						})),
					},
				},
			);

			const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
			console.log(
				`[uploadStream] complete → ETag: ${finalETag} | ${totalElapsed}s total`,
			);

			return {
				path: input.path,
				eTag: finalETag,
				contentType,
			};
		} catch (error) {
			aborted = true;
			console.log(`[uploadStream] error: ${error} — aborting upload`);
			// Wait for in-flight uploads to settle (ignore their errors)
			await Promise.allSettled(inFlight).catch(() => {});
			await abortMultipartUpload(
				{
					...s3Config,
					userAgentValue: getStorageUserAgentValue(StorageAction.UploadData),
				},
				{
					Bucket: bucket,
					Key: finalKey,
					UploadId,
				},
			).catch(() => {
				/* best-effort cleanup */
			});
			throw error;
		}
	})();

	return {
		result,
		cancel: () => abortController.abort(),
	};
}
