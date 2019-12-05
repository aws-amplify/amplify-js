/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import { S3Client } from '@aws-sdk/client-s3-browser/S3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3-browser/commands/PutObjectCommand';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3-browser/commands/CreateMultipartUploadCommand';
import {
	UploadPartCommand,
	UploadPartInput,
	UploadPartOutput,
} from '@aws-sdk/client-s3-browser/commands/UploadPartCommand';
import {
	CompleteMultipartUploadCommand,
	CompleteMultipartUploadInput,
} from '@aws-sdk/client-s3-browser/commands/CompleteMultipartUploadCommand';
import { StorageOptions, StorageProvider } from '../types';
import { AxiosHttpHandler } from './axios-http-handler';
import { fromString } from '@aws-sdk/util-buffer-from';
import * as events from 'events';

import * as S3 from 'aws-sdk/clients/s3';

const localTestingStorageEndpoint = 'http://localhost:20005';

declare interface BodyPart {
	bodyPart: string;
	partNumber: number;
	emitter: any;
	etag?: string;
	_lastUploadedBytes: number;
}

export class AWSS3ProviderManagedUpload {
	private minPartSize = 5 * 1024 * 1024; // in MB
	private queueSize = 10;

	// Data for current upload
	private body = null;
	private params = null;
	private opts = null;
	private multiPartMap = [];

	// Progress reporting
	private bytesUploaded = 0;
	private totalBytesToUpload = 0;
	private emitter = null;

	constructor(params, opts, emitter) {
		this.params = params;
		this.opts = opts;
		this.emitter = emitter;
	}

	public async upload() {
		this.body = this.validateAndSanitizeBody(this.params.Body);
		this.totalBytesToUpload = this.byteLength(this.body); // TODO: Cannot pass an object. Has to be a string?
		console.log('Uploading file of size ', this.totalBytesToUpload);
		if (this.totalBytesToUpload <= this.minPartSize) {
			const putObjectCommand = new PutObjectCommand(this.params);
			const s3 = this._createNewS3Client(this.opts, this.emitter);
			return s3.send(putObjectCommand);
		} else {
			// Step 1: Initiate the multi part upload
			const uploadId = await this.createMultiPartUpload_old();

			// Step 2: Upload chunks in parallel as requested
			const numberOfPartsToUpload = Math.ceil(
				this.totalBytesToUpload / this.minPartSize
			);
			for (
				let start = 0;
				start < numberOfPartsToUpload;
				start += this.queueSize
			) {
				// Upload as many as `queueSize` parts simultaneously
				const parts: BodyPart[] = this.createParts(start);
				await this.uploadParts(uploadId, parts);
			}

			// Step 3: Finalize the upload such that S3 can recreate the file
			await this.finishMultiPartUpload_old(uploadId);
		}
	}

	private createParts(startPartNumber: number): BodyPart[] {
		const parts: BodyPart[] = [];
		let partNumber = startPartNumber;
		for (
			let bodyStart = startPartNumber * this.minPartSize;
			bodyStart < this.totalBytesToUpload && parts.length < this.queueSize;

		) {
			const bodyEnd = Math.min(
				bodyStart + this.minPartSize,
				this.totalBytesToUpload
			);
			parts.push({
				bodyPart: this.body.slice(bodyStart, bodyEnd),
				partNumber: ++partNumber,
				emitter: new events.EventEmitter(),
				_lastUploadedBytes: 0,
			});
			bodyStart += this.minPartSize;
		}
		return parts;
	}

	private async createMultiPartUpload() {
		const createMultiPartUploadCommand = new CreateMultipartUploadCommand({
			Bucket: this.params.Bucket,
			Key: this.params.Key,
		});
		const s3 = this._createNewS3Client(this.opts);
		s3.middlewareStack.remove('SET_CONTENT_LENGTH');
		const response = await s3.send(createMultiPartUploadCommand);
		console.log(response.UploadId);
		return response.UploadId;
	}

	private async createMultiPartUpload_old() {
		const s3 = new S3(this.opts);
		const data = await s3
			.createMultipartUpload({
				Bucket: this.params.Bucket,
				Key: this.params.Key,
				ContentType: this.params.ContentType,
			})
			.promise();
		return data.UploadId;
	}

	private async uploadParts(uploadId: string, parts: BodyPart[]) {
		const promises: Array<Promise<UploadPartOutput>> = [];
		for (const part of parts) {
			this.setupEventListener(part);
			const uploadPartCommandInput: UploadPartInput = {
				PartNumber: part.partNumber,
				Body: part.bodyPart,
				UploadId: uploadId,
				Key: this.params.Key,
				Bucket: this.params.Bucket,
			};
			const uploadPartCommand = new UploadPartCommand(uploadPartCommandInput);
			const s3 = this._createNewS3Client(this.opts, part.emitter);
			promises.push(s3.send(uploadPartCommand));
		}
		const allResults: Array<UploadPartOutput> = await Promise.all(promises);

		// The order of resolved promises is the same as input promise order.
		for (let i = 0; i < allResults.length; i++) {
			this.multiPartMap.push({
				PartNumber: parts[i].partNumber,
				ETag: allResults[i].ETag,
			});
		}
	}

	private async finishMultiPartUpload(uploadId: string) {
		const input: CompleteMultipartUploadInput = {
			Bucket: this.params.Bucket,
			Key: this.params.Key,
			UploadId: uploadId,
			MultipartUpload: { Parts: this.multiPartMap },
		};
		const completeUploadCommand = new CompleteMultipartUploadCommand(input);
		const s3 = this._createNewS3Client(this.opts);
		s3.middlewareStack.remove('SET_CONTENT_LENGTH');
		const data = await s3.send(completeUploadCommand);
		console.log(data);
		return data.Key;
	}

	private async finishMultiPartUpload_old(uploadId: string) {
		const input = {
			Bucket: this.params.Bucket,
			Key: this.params.Key,
			UploadId: uploadId,
			MultipartUpload: { Parts: this.multiPartMap },
		};
		const s3 = new S3(this.opts);
		const data = await s3.completeMultipartUpload(input).promise();
		console.log(data);
		return data.Key;
	}

	private setupEventListener(part: BodyPart) {
		part.emitter.on('sendProgress', progress => {
			this.progressChanged(
				part.partNumber,
				progress.loaded - part._lastUploadedBytes
			);
			part._lastUploadedBytes = progress.loaded;
		});
	}

	private progressChanged(partNumber: number, incrementalUpdate: number) {
		this.bytesUploaded += incrementalUpdate;
		this.emitter.emit('sendProgress', {
			loaded: this.bytesUploaded,
			total: this.totalBytesToUpload,
			part: partNumber,
			key: this.params.Key,
		});
	}

	private byteLength(inputString: any) {
		if (inputString === null || inputString === undefined) return 0;
		if (typeof inputString.byteLength === 'number') {
			return inputString.byteLength;
		} else if (typeof inputString.length === 'number') {
			return inputString.length;
		} else if (typeof inputString.size === 'number') {
			return inputString.size;
			// } else if (typeof string.path === 'string') {
			// 	return require('fs').lstatSync(string.path).size;
		} else {
			throw new Error('Cannot determine length of ' + inputString);
		}
	}

	private validateAndSanitizeBody(body: any): any {
		if (body instanceof File) {
			return body;
		} else if (typeof body === 'string') {
			return fromString(body);
		} else {
			return fromString(JSON.stringify(body));
		}
	}

	/**
	 * @private creates an S3 client with new V3 aws sdk
	 */
	protected _createNewS3Client(config, emitter?) {
		const {
			region,
			credentials,
			dangerouslyConnectToHttpEndpointForTesting,
		} = config;
		let localTestingConfig = {};

		if (dangerouslyConnectToHttpEndpointForTesting) {
			localTestingConfig = {
				endpoint: localTestingStorageEndpoint,
				s3BucketEndpoint: true,
				s3ForcePathStyle: true,
			};
		}

		const client = new S3Client({
			region,
			credentials,
			...localTestingConfig,
			httpHandler: new AxiosHttpHandler({}, emitter),
		});
		return client;
	}
}
