// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger as Logger } from '@aws-amplify/core';
import {
	PutObjectCommand,
	PutObjectRequest,
	CreateMultipartUploadCommand,
	UploadPartCommand,
	CompleteMultipartUploadCommand,
	CompleteMultipartUploadCommandInput,
	ListPartsCommand,
	AbortMultipartUploadCommand,
	CompletedPart,
	S3Client,
} from '@aws-sdk/client-s3';
import {
	SEND_UPLOAD_PROGRESS_EVENT,
	SEND_DOWNLOAD_PROGRESS_EVENT,
	AxiosHttpHandlerOptions,
} from './axios-http-handler';
import * as events from 'events';
import {
	createPrefixMiddleware,
	prefixMiddlewareOptions,
	autoAdjustClockskewMiddleware,
	autoAdjustClockskewMiddlewareOptions,
	createS3Client,
} from '../common/S3ClientUtils';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadFileTask } from '../types';
import RNUpload from './RNUploadService';

const logger = new Logger('AWSS3ProviderManagedUpload');

export declare interface Part {
	bodyPart: any;
	partNumber: number;
	emitter: events.EventEmitter;
	etag?: string;
	_lastUploadedBytes: number;
}

export class AWSS3ProviderManagedUpload {
	// Defaults
	protected minPartSize = 5 * 1024 * 1024; // in MB
	private queueSize = 4;

	// Data for current upload
	private body = null;
	private params: PutObjectRequest = null;
	private opts = null;
	private completedParts: CompletedPart[] = [];
	private s3client: S3Client;
	private uploadId = null;

	// Progress reporting
	private bytesUploaded = 0;
	private totalBytesToUpload = 0;
	private emitter: events.EventEmitter = null;

	//callbacks
	private uploadFileConfigs: any;

	constructor(
		params: PutObjectRequest,
		opts,
		emitter: events.EventEmitter,
		uploadFileConfigs?
	) {
		this.params = params;
		this.opts = opts;
		this.uploadFileConfigs = uploadFileConfigs;
		this.emitter = emitter;
		this.s3client = this._createNewS3Client(opts, emitter);
	}

	public async upload() {
		try {
			this.body = await this.validateAndSanitizeBody(this.params.Body);
			this.totalBytesToUpload = this.byteLength(this.body);
			if (this.totalBytesToUpload <= this.minPartSize) {
				// Multipart upload is not required. Upload the sanitized body as is
				this.params.Body = this.body;
				const putObjectCommand = new PutObjectCommand(this.params);
				return this.s3client.send(putObjectCommand);
			} else {
				// Step 1: Initiate the multi part upload
				this.uploadId = await this.createMultiPartUpload();

				// Step 2: Upload chunks in parallel as requested
				const numberOfPartsToUpload = Math.ceil(
					this.totalBytesToUpload / this.minPartSize
				);

				const parts: Part[] = this.createParts();
				for (
					let start = 0;
					start < numberOfPartsToUpload;
					start += this.queueSize
				) {
					// Upload as many as `queueSize` parts simultaneously
					await this.uploadParts(
						this.uploadId,
						parts.slice(start, start + this.queueSize)
					);
				}

				parts.map(part => {
					this.removeEventListener(part);
				});

				// Step 3: Finalize the upload such that S3 can recreate the file
				return await this.finishMultiPartUpload(this.uploadId);
			}
		} catch (error) {
			// if any error is thrown, call cleanup
			await this.cleanup(this.uploadId);
			logger.error('Error. Cancelling the multipart upload.');
			throw error;
		}
	}

	public async uploadFile(): Promise<UploadFileTask> {
		try {
			if (Object.keys(RNUpload).length === 0) {
				return {} as UploadFileTask;
			}

			//To-do : Calculate MD5 Checksum and Use the checksum to generate the PreSignedUrl. At the time of upload set content-md5 header to confirm file integrity.
			/* 			const FileCheckSum = await RNUpload.getMD5CheckSumFromFilePath(
				this.params.Body
			);
			console.log('MD5 CheckSum: ', FileCheckSum);
 			*/
			const preSignedUrl = await this.getPreSignedUrl();
			//console.log('generated preSignedUrl: ', preSignedUrl);
			const {
				progressCallback,
				successCallback,
				errorCallback,
				cancelCallback,
				notifications,
			} = this.uploadFileConfigs;

			const options = {
				url: preSignedUrl,
				path: this.params.Body as any,
				method: 'PUT',
				type: 'raw',
				maxRetries: 2,
				/* headers: {
					'Content-Length': 'application/octet-stream', // Customize content-type
				}, */
				notification: {
					enabled: notifications?.enabled,
					onProgressTitle:
						notifications?.progressMsg?.title || 'Uploading ' + this.params.Key,
					onProgressMessage: notifications?.progressMsg?.message,
					onCompleteTitle:
						notifications?.successMsg?.title ||
						'Upload finished ' + this.params.Key,
					onCompleteMessage: notifications?.successMsg?.message,
					onErrorTitle:
						notifications?.errorMsg?.title ||
						'Error uploading ' + this.params.Key,
					onErrorMessage: notifications?.errorMsg?.message,
					onCancelledTitle:
						notifications?.cancelledMsg?.title ||
						'Upload cancelled: ' + this.params.Key,
					onCancelledMessage: notifications?.cancelledMsg?.message,
				},
				useUtf8Charset: true,
			};

			const uploadId = await RNUpload.startUpload(options);
			console.log('Upload happening', uploadId);
			RNUpload.addListener('progress', uploadId, progressCallback);
			RNUpload.addListener('error', uploadId, errorCallback);
			RNUpload.addListener('cancelled', uploadId, cancelCallback);
			RNUpload.addListener('completed', uploadId, successCallback);

			return {
				uploadId: uploadId,
				cancel: function () {
					RNUpload.cancelUpload(uploadId);
				},
			};
		} catch (error) {
			// if any error is thrown, call cleanup
			console.log('Inside Catch block error: ', error);

			logger.error('Error. Cancelling the  upload.');
			throw error;
		}
	}

	private async getPreSignedUrl() {
		try {
			// Create a command to put the object in the S3 bucket.
			const command = new PutObjectCommand(this.params);
			console.log('Chintan');
			console.log(this.params);
			// Create the presigned URL.
			const signedUrl = await getSignedUrl(this.s3client, command, {
				expiresIn: 3600,
			});
			console.log(
				`\nPutting "${this.params.Key}" using signedUrl with body in v3`
			);
			return signedUrl;
		} catch (err) {
			console.log('Error creating presigned URL', err);
		}
	}

	private createParts(): Part[] {
		try {
			const parts: Part[] = [];
			for (let bodyStart = 0; bodyStart < this.totalBytesToUpload; ) {
				const bodyEnd = Math.min(
					bodyStart + this.minPartSize,
					this.totalBytesToUpload
				);
				parts.push({
					bodyPart: this.body.slice(bodyStart, bodyEnd),
					partNumber: parts.length + 1,
					emitter: new events.EventEmitter(),
					_lastUploadedBytes: 0,
				});
				bodyStart += this.minPartSize;
			}
			return parts;
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	private async createMultiPartUpload() {
		try {
			const createMultiPartUploadCommand = new CreateMultipartUploadCommand(
				this.params
			);
			const response = await this.s3client.send(createMultiPartUploadCommand);
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
					const options: AxiosHttpHandlerOptions = { emitter: part.emitter };
					const {
						Key,
						Bucket,
						SSECustomerAlgorithm,
						SSECustomerKey,
						SSECustomerKeyMD5,
					} = this.params;
					const res = await this.s3client.send(
						new UploadPartCommand({
							PartNumber: part.partNumber,
							Body: part.bodyPart,
							UploadId: uploadId,
							Key,
							Bucket,
							...(SSECustomerAlgorithm && { SSECustomerAlgorithm }),
							...(SSECustomerKey && { SSECustomerKey }),
							...(SSECustomerKeyMD5 && { SSECustomerKeyMD5 }),
						}),
						options
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
		const input: CompleteMultipartUploadCommandInput = {
			Bucket: this.params.Bucket,
			Key: this.params.Key,
			UploadId: uploadId,
			MultipartUpload: { Parts: this.completedParts },
		};
		const completeUploadCommand = new CompleteMultipartUploadCommand(input);
		try {
			const data = await this.s3client.send(completeUploadCommand);
			return data.Key;
		} catch (error) {
			logger.error('Error happened while finishing the upload.');
			throw error;
		}
	}

	private async cleanup(uploadId: string) {
		// Reset this's state
		this.body = null;
		this.completedParts = [];
		this.bytesUploaded = 0;
		this.totalBytesToUpload = 0;

		const input = {
			Bucket: this.params.Bucket,
			Key: this.params.Key,
			UploadId: uploadId,
		};

		await this.s3client.send(new AbortMultipartUploadCommand(input));

		// verify that all parts are removed.
		const data = await this.s3client.send(new ListPartsCommand(input));

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

	private async validateAndSanitizeBody(body: any): Promise<any> {
		if (this.isGenericObject(body)) {
			// Any javascript object
			return JSON.stringify(body);
		} else {
			// Files, arrayBuffer etc
			return body;
		}
		/* TODO: streams and files for nodejs 
		if (
			typeof body.path === 'string' &&
			require('fs').lstatSync(body.path).size > 0
		) {
			return body;
		} */
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

	protected _createNewS3Client(config, emitter?: events.EventEmitter) {
		const s3client = createS3Client(config, emitter);
		s3client.middlewareStack.add(
			createPrefixMiddleware(this.opts, this.params.Key),
			prefixMiddlewareOptions
		);
		s3client.middlewareStack.add(
			autoAdjustClockskewMiddleware(s3client.config),
			autoAdjustClockskewMiddlewareOptions
		);
		return s3client;
	}
}
