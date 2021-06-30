import {
	UploadPartCommandInput,
	CompletedPart,
	S3Client,
	UploadPartCommand,
	UploadPartCommandOutput,
	CompleteMultipartUploadCommand,
	Part,
	AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { TaskEvents } from './AWSS3UploadManager';
import * as events from 'events';
import axios, { Canceler } from 'axios';
import { HttpHandlerOptions } from '@aws-sdk/types';
import { UploadTask } from '../types/Provider';
import { Logger } from '@aws-amplify/core';

const logger = new Logger('Storage');

enum State {
	INIT,
	IN_PROGRESS,
	PAUSED,
	ABORTED,
}

export interface AWSS3UploadTaskParams {
	s3Client: S3Client;
	uploadId: string;
	bucket: string;
	key: string;
	body: Blob;
	partSize?: number;
	/** Completed Parts from an existing multipart upload */
	completedParts?: Part[];
	emitter?: events.EventEmitter;
}

export interface InProgressRequest {
	uploadPartInput: UploadPartCommandInput;
	s3Request: Promise<any>;
	cancel: Canceler;
}

export type PartCompletionEvent = UploadPartCommandOutput & { part: UploadPartCommandInput };

const MAX_PARTS = 10000;
const MIN_PART_SIZE = 5 * 1024 * 1024;
const DEFAULT_QUEUE_SIZE = 4;

function comparePartNumber(a: CompletedPart, b: CompletedPart) {
	return a.PartNumber - b.PartNumber;
}

export class AWSS3UploadTask implements UploadTask {
	private readonly emitter: events.EventEmitter;
	private readonly partSize: number;
	private readonly queueSize = DEFAULT_QUEUE_SIZE;
	private readonly s3client: S3Client;
	private inProgressRequest: InProgressRequest[] = [];
	private completedParts: CompletedPart[] = [];
	private uploadedPartsFromStorage: Part[] = [];
	private queuedParts: UploadPartCommandInput[] = [];
	private file: Blob;
	private bytesUploaded: number;
	private totalBytes: number;
	private state: State = State.INIT;

	readonly bucket: string;
	readonly key: string;
	readonly uploadId: UploadPartCommandInput['UploadId'];

	constructor({ s3Client, uploadId, bucket, key, body, completedParts, emitter }: AWSS3UploadTaskParams) {
		this.s3client = s3Client;
		this.uploadId = uploadId;
		this.bucket = bucket;
		this.key = key;
		this.file = body;
		this.partSize = MIN_PART_SIZE;
		this.totalBytes = this.file.size;
		this.bytesUploaded = 0;
		this.emitter = emitter;
		this.uploadedPartsFromStorage = completedParts;
		this._validateParams();
	}

	private _validateParams() {
		if (this.uploadId === null || this.uploadId === undefined) {
			throw new Error('UploadId must be specified for an upload task');
		}
		if (this.file.size < MIN_PART_SIZE) {
			throw new Error(`Only files above ${MIN_PART_SIZE / (1024 * 1024)}MB allowed`);
		}
		if (this.file.size / this.partSize > MAX_PARTS) {
			throw new Error('Too many parts');
		}
	}

	private _onPartUploadCompletion({ eTag, partNumber, chunk }: { eTag: string; partNumber: number; chunk: unknown }) {
		if (!this._isBlob(chunk)) return;
		this.completedParts.push({
			ETag: eTag,
			PartNumber: partNumber,
		});
		this.bytesUploaded += chunk.size;
		this.emitter.emit('uploadPartProgress', {
			loaded: this.bytesUploaded,
			total: this.totalBytes,
		});
		// Remove the completed item from the inProgress array
		this.inProgressRequest = this.inProgressRequest.filter(job => job.uploadPartInput.PartNumber !== partNumber);
		if (this.queuedParts.length && this.state !== State.PAUSED) this._startNextPart();
		if (this._isDone()) {
			this._completeUpload();
		}
	}

	private _completeUpload() {
		this.s3client
			.send(
				new CompleteMultipartUploadCommand({
					Bucket: this.bucket,
					Key: this.key,
					UploadId: this.uploadId,
					MultipartUpload: {
						// Parts are not always completed in order, we need to manually sort them
						Parts: this.completedParts.sort(comparePartNumber),
					},
				})
			)
			.then(res => {
				console.log('Completed upload', res);
				this.emitter.emit(TaskEvents.UPLOAD_COMPLETE, { key: `${this.bucket}/${this.key}` });
			})
			.catch(err => {
				console.error('error completing upload', err);
			});
	}

	private _isBlob(x: unknown): x is Blob {
		return typeof x !== 'undefined' && x instanceof Blob;
	}

	private _startNextPart() {
		if (this.queuedParts.length > 0 && this.state !== State.PAUSED) {
			const cancelTokenSource = axios.CancelToken.source();
			const nextPart = this.queuedParts.shift();
			this.inProgressRequest.push({
				uploadPartInput: nextPart,
				s3Request: this.s3client
					.send(new UploadPartCommand(nextPart), {
						cancelTokenSource,
					} as HttpHandlerOptions)
					.then(output => {
						this._onPartUploadCompletion({
							eTag: output.ETag,
							partNumber: nextPart.PartNumber,
							chunk: nextPart.Body,
						});
						return output;
					})
					.catch(err => {
						console.error('Stahp', err);
					}),
				cancel: cancelTokenSource.cancel,
			});
		}
	}

	private _isDone() {
		console.log('pending', this.queuedParts);
		console.log('inprogress', this.inProgressRequest);
		return !this.queuedParts.length && !this.inProgressRequest.length;
	}

	private _attachEvent(name: string) {
		return (fn: Function) => this.emitter.on(name, fn.bind(this));
	}

	private _attachUploadCompleteEvent(fn) {
		return this._attachEvent(TaskEvents.UPLOAD_COMPLETE)(fn);
	}

	private _attachUploadProgressEvent(fn) {
		return this._attachEvent('uploadPartProgress')(fn);
	}

	public onComplete(fn: Function) {
		if (Array.isArray(fn)) {
			fn.forEach(this._attachUploadCompleteEvent, this);
		} else {
			this._attachUploadCompleteEvent(fn);
		}
	}

	public onProgress(fn: Function) {
		if (Array.isArray(fn)) {
			fn.forEach(this._attachUploadProgressEvent, this);
		} else {
			this._attachUploadProgressEvent(fn);
		}
	}

	public start() {
		if (this.state === State.ABORTED) {
			throw new Error('This task has already been aborted');
		} else if (this.bytesUploaded === this.totalBytes) {
			logger.warn('This task has already been completed');
		} else if (this.state === State.IN_PROGRESS) {
			logger.warn('Upload task already in progress');
		}
		if (this.bytesUploaded > 0) {
			this.resume();
		} else {
			this.state = State.IN_PROGRESS;
			this.queuedParts = this._createParts();
			// If there are pre-existing completed parts, calculate the bytes uploaded
			if (this.uploadedPartsFromStorage) {
				this._initCachedUploadParts();
			}
			for (let i = 0; i < this.queueSize; i++) {
				this._startNextPart();
			}
		}
	}

	private _createParts() {
		const size = this.file.size;
		const parts: UploadPartCommandInput[] = [];
		for (let bodyStart = 0; bodyStart < size; ) {
			const bodyEnd = Math.min(bodyStart + this.partSize, size);
			parts.push({
				Body: this.file.slice(bodyStart, bodyEnd),
				Key: this.key,
				Bucket: this.bucket,
				PartNumber: parts.length + 1,
				UploadId: this.uploadId,
			});
			bodyStart += this.partSize;
		}
		return parts;
	}

	private _initCachedUploadParts() {
		this.bytesUploaded += this.uploadedPartsFromStorage.reduce((acc, part) => acc + part.Size, 0);
		this.emitter.emit('uploadPartProgress', {
			loaded: this.bytesUploaded,
			total: this.totalBytes,
		});
		// Find the set of part numbers that have already been uploaded
		const uploadedPartNumSet = new Set(this.uploadedPartsFromStorage.map(part => part.PartNumber));
		this.queuedParts = this.queuedParts.filter(part => !uploadedPartNumSet.has(part.PartNumber));
		this.completedParts = this.uploadedPartsFromStorage.map(part => ({
			PartNumber: part.PartNumber,
			ETag: part.ETag,
		}));
		// Just in case that the request has already been completed, we just complete the upload
		if (this._isDone()) this._completeUpload();
	}

	public resume(): void {
		this.state = State.IN_PROGRESS;
		for (let i = 0; i < this.queueSize; i++) {
			this._startNextPart();
		}
	}

	public abort(): void {
		this.pause('Aborted');
		this.queuedParts = [];
		this.completedParts = [];
		this.bytesUploaded = 0;
		this.state = State.ABORTED;
		this.emitter.emit(TaskEvents.ABORT);
		this.s3client
			.send(
				new AbortMultipartUploadCommand({
					Bucket: this.bucket,
					Key: this.key,
					UploadId: this.uploadId,
				})
			)
			.then(res => {
				console.log(res);
			});
	}

	/**
	 * pause this particular upload task
	 **/
	public pause(message?: string): void {
		this.state = State.PAUSED;
		// use axios cancel token to abort the part request immediately
		// Add the inProgress parts back to pending
		const removedInProgressReq = this.inProgressRequest.splice(0, this.inProgressRequest.length);
		removedInProgressReq.forEach(req => {
			req.cancel(message);
		});
		// Put all removed in progress parts back into the queue
		this.queuedParts.unshift(...removedInProgressReq.map(req => req.uploadPartInput));
	}
}
