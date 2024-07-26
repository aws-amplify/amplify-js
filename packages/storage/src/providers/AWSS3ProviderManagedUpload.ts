// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger, StorageAction } from '@aws-amplify/core';
import {
	PutObjectInput,
	putObject,
	createMultipartUpload,
	CompletedPart,
	uploadPart,
	CompleteMultipartUploadInput,
	completeMultipartUpload,
	abortMultipartUpload,
	listParts,
} from '../AwsClients/S3';
import {
	SEND_DOWNLOAD_PROGRESS_EVENT,
	SEND_UPLOAD_PROGRESS_EVENT,
} from '../AwsClients/S3/utils';
import { EventEmitter } from 'events';
import { calculateContentMd5 } from '../common/MD5utils';
import {
	calculatePartSize,
	DEFAULT_PART_SIZE,
	DEFAULT_QUEUE_SIZE,
	MAX_OBJECT_SIZE,
	S3ResolvedConfig,
	loadS3Config,
	getPrefix,
	credentialsProvider,
} from '../common/S3ClientUtils';

const logger = new Logger('AWSS3ProviderManagedUpload');

export declare interface Part {
	bodyPart: any;
	partNumber: number;
	emitter: EventEmitter;
	etag?: string;
	_lastUploadedBytes: number;
}

export class AWSS3ProviderManagedUpload {
	// Data for current upload
	private body;
	private params: PutObjectInput;
	private opts = null;
	private completedParts: CompletedPart[] = [];
	private s3Config: S3ResolvedConfig;
	private uploadId: string | undefined;
	private partSize = DEFAULT_PART_SIZE;

	// Progress reporting
	private bytesUploaded = 0;
	private totalBytesToUpload = 0;
	private emitter: EventEmitter | null = null;

	constructor(params: PutObjectInput, opts, emitter: EventEmitter) {
		this.params = params;
		this.opts = {
			isObjectLockEnabled: false,
			...opts,
		};
		this.emitter = emitter;
		this.s3Config = loadS3Config({
			...opts,
			emitter,
			storageAction: StorageAction.Put,
		});
	}

	public async upload() {
		try {
			const { isObjectLockEnabled } = this.opts;
			if (isObjectLockEnabled === true) {
				this.params.ContentMD5 = await calculateContentMd5(
					// @ts-expect-error currently ReadableStream<any> is not being supported in put api
					this.params.Body
				);
			}
			this.body = this.validateAndSanitizeBody(this.params.Body);
			this.totalBytesToUpload = this.byteLength(this.body);
			if (this.totalBytesToUpload <= DEFAULT_PART_SIZE) {
				// Multipart upload is not required. Upload the sanitized body as is
				this.params.Body = this.body;
				return putObject(this.s3Config, {
					...this.params,
					Key: await this.getObjectKeyWithPrefix(this.params.Key),
				});
			} else {
				// Step 1: Determine appropriate part size.
				this.partSize = calculatePartSize(this.totalBytesToUpload);
				// Step 2: Initiate the multi part upload
				this.uploadId = await this.createMultiPartUpload();

				// Step 3: Upload chunks in parallel as requested
				const numberOfPartsToUpload = Math.ceil(
					this.totalBytesToUpload / this.partSize
				);

				const parts: Part[] = this.createParts();
				for (
					let start = 0;
					start < numberOfPartsToUpload;
					start += DEFAULT_QUEUE_SIZE
				) {
					// Upload as many as `queueSize` parts simultaneously
					await this.uploadParts(
						this.uploadId!,
						parts.slice(start, start + DEFAULT_QUEUE_SIZE)
					);
				}

				parts.map(part => {
					this.removeEventListener(part);
				});

				// Step 3: Finalize the upload such that S3 can recreate the file
				return await this.finishMultiPartUpload(this.uploadId!);
			}
		} catch (error) {
			// if any error is thrown, call cleanup
			await this.cleanup(this.uploadId);
			logger.error('Error. Cancelling the multipart upload.');
			throw error;
		}
	}

	private createParts(): Part[] {
		try {
			const parts: Part[] = [];
			for (let bodyStart = 0; bodyStart < this.totalBytesToUpload; ) {
				const bodyEnd = Math.min(
					bodyStart + this.partSize,
					this.totalBytesToUpload
				);
				parts.push({
					bodyPart: this.body.slice(bodyStart, bodyEnd),
					partNumber: parts.length + 1,
					emitter: new EventEmitter(),
					_lastUploadedBytes: 0,
				});
				bodyStart += this.partSize;
			}
			return parts;
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	private async createMultiPartUpload() {
		try {
			const response = await createMultipartUpload(this.s3Config, {
				...this.params,
				Key: await this.getObjectKeyWithPrefix(this.params.Key),
			});
			logger.debug(response.UploadId);
			return response.UploadId;
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @private Not to be extended outside of tests
	 * @VisibleFotTesting
	 */
	protected async uploadParts(uploadId: string, parts: Part[]) {
		try {
			const allResults = await Promise.all(
				parts.map(async part => {
					this.setupEventListener(part);
					const { isObjectLockEnabled } = this.opts;
					if (isObjectLockEnabled) {
						this.params.ContentMD5 = await calculateContentMd5(part.bodyPart);
					}
					const {
						Key,
						Bucket,
						SSECustomerAlgorithm,
						SSECustomerKey,
						SSECustomerKeyMD5,
						ContentMD5,
					} = this.params;
					const res = await uploadPart(
						{ ...this.s3Config, emitter: part.emitter },
						{
							PartNumber: part.partNumber,
							Body: part.bodyPart,
							UploadId: uploadId,
							Key: await this.getObjectKeyWithPrefix(this.params.Key),
							Bucket,
							SSECustomerAlgorithm,
							SSECustomerKey,
							SSECustomerKeyMD5,
							ContentMD5,
						}
					);
					return res;
				})
			);
			// The order of resolved promises is the same as input promise order.
			for (let i = 0; i < allResults.length; i++) {
				this.completedParts.push({
					PartNumber: parts[i].partNumber,
					ETag: allResults[i].ETag,
				});
			}
		} catch (error) {
			logger.error(
				'Error happened while uploading a part. Cancelling the multipart upload'
			);
			throw error;
		}
	}

	private async finishMultiPartUpload(uploadId: string) {
		const input: CompleteMultipartUploadInput = {
			Bucket: this.params.Bucket,
			Key: await this.getObjectKeyWithPrefix(this.params.Key),
			UploadId: uploadId,
			MultipartUpload: { Parts: this.completedParts },
		};
		try {
			const { Key } = await completeMultipartUpload(
				{ ...this.s3Config, emitter: undefined },
				input
			);
			return Key;
		} catch (error) {
			logger.error('Error happened while finishing the upload.');
			throw error;
		}
	}

	private async cleanup(uploadId: string | undefined) {
		// Reset this's state
		this.body = null;
		this.completedParts = [];
		this.bytesUploaded = 0;
		this.totalBytesToUpload = 0;

		if (!uploadId) {
			// This is a single part upload;
			return;
		}

		const input = {
			Bucket: this.params.Bucket,
			Key: await this.getObjectKeyWithPrefix(this.params.Key),
			UploadId: uploadId,
		};

		await abortMultipartUpload(this.s3Config, input);

		// verify that all parts are removed.
		const data = await listParts(this.s3Config, input);

		if (data && data.Parts && data.Parts.length > 0) {
			throw new Error('Multipart upload clean up failed.');
		}
	}

	private removeEventListener(part: Part) {
		part.emitter.removeAllListeners(SEND_UPLOAD_PROGRESS_EVENT);
		part.emitter.removeAllListeners(SEND_DOWNLOAD_PROGRESS_EVENT);
	}

	private setupEventListener(part: Part) {
		part.emitter.on(SEND_UPLOAD_PROGRESS_EVENT, progress => {
			this.progressChanged(
				part.partNumber,
				progress.loaded - part._lastUploadedBytes
			);
			part._lastUploadedBytes = progress.loaded;
		});
	}

	private progressChanged(partNumber: number, incrementalUpdate: number) {
		this.bytesUploaded += incrementalUpdate;
		this.emitter.emit(SEND_UPLOAD_PROGRESS_EVENT, {
			loaded: this.bytesUploaded,
			total: this.totalBytesToUpload,
			part: partNumber,
			key: this.params.Key,
		});
	}

	private byteLength(input: any) {
		if (input === null || input === undefined) return 0;
		if (typeof input.byteLength === 'number') {
			return input.byteLength;
		} else if (typeof input.length === 'number') {
			return input.length;
		} else if (typeof input.size === 'number') {
			return input.size;
		} else if (typeof input.path === 'string') {
			/* NodeJs Support
			return require('fs').lstatSync(input.path).size;
			*/
		} else {
			throw new Error('Cannot determine length of ' + input);
		}
	}

	private validateAndSanitizeBody(body: any): any {
		const sanitizedBody = this.isGenericObject(body)
			? JSON.stringify(body)
			: body;
		/* TODO: streams and files for nodejs 
		if (
			typeof body.path === 'string' &&
			require('fs').lstatSync(body.path).size > 0
		) {
			sanitizedBody = body;
		} */
		if (this.byteLength(sanitizedBody) > MAX_OBJECT_SIZE) {
			throw new Error(
				`File size bigger than S3 Object limit of 5TB, got ${this.totalBytesToUpload} Bytes`
			);
		}
		return sanitizedBody;
	}

	private isGenericObject(body: any): body is Object {
		if (body !== null && typeof body === 'object') {
			try {
				return !(this.byteLength(body) >= 0);
			} catch (error) {
				// If we cannot determine the length of the body, consider it
				// as a generic object and upload a stringified version of it
				return true;
			}
		}
		return false;
	}

	private async getObjectKeyWithPrefix(keyWithoutPrefix: string) {
		return (
			(await getPrefix({
				...this.opts,
				credentials: await credentialsProvider(),
			})) + keyWithoutPrefix
		);
	}
}
