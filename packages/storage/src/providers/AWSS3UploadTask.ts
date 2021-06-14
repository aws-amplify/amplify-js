import {
	UploadPartCommandInput,
	CompletedPart,
	S3Client,
	UploadPartCommand,
	UploadPartCommandOutput,
	CompleteMultipartUploadCommand,
	Part,
} from '@aws-sdk/client-s3';
import * as events from 'events';
import axios, { Canceler } from 'axios';
import { HttpHandlerOptions } from '@aws-sdk/types';
import { UploadTask } from '../types/Provider';

enum State {
	PENDING,
	IN_PROGRESS,
	PAUSED,
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

export interface inProgressRequest {
	uploadPartInput: UploadPartCommandInput;
	s3Request: Promise<UploadPartCommandOutput>;
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
	private readonly queueSize = DEFAULT_QUEUE_SIZE;
	private readonly emitter: events.EventEmitter;
	private readonly s3client: S3Client;
	private inProgressRequest: inProgressRequest[] = [];
	private completedParts: CompletedPart[] = [];
	private uploadedPartsFromStorage: Part[] = [];
	private queuedParts: UploadPartCommandInput[] = [];
	private file: Blob;
	private bytesUploaded: number;
	private totalBytes: number;
	private partSize: number;
	private state: State = State.PENDING;
	private onCompleteCallback: (...args) => void;
	private onProgressCallback: (...args) => void;

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
			throw new Error(`You must provide an uploadId before creating an upload task`);
		}
		if (this.file.size < MIN_PART_SIZE) {
			throw new Error(`Only files above ${MIN_PART_SIZE / (1024 * 1024)}MB allowed`);
		}
		if (this.file.size / this.partSize > MAX_PARTS) {
			throw new Error('Too many parts');
		}
	}

	private _onPartUploadCompletion(event: PartCompletionEvent) {
		if (!this._isBlob(event.part.Body)) return;

		this.completedParts.push({
			ETag: event.ETag,
			PartNumber: event.part.PartNumber,
		});
		this.bytesUploaded += event.part.Body.size;
		this.emitter.emit('uploadPartProgress', {
			loaded: this.bytesUploaded,
			total: this.totalBytes,
		});
		// Remove the completed item from the inProgress array
		this.inProgressRequest = this.inProgressRequest.filter(
			job => job.uploadPartInput.PartNumber !== event.part.PartNumber
		);
		if (this.queuedParts.length && this.state !== State.PAUSED) this._startNextPart();
		if (this._isDone()) {
			this.s3client
				.send(
					new CompleteMultipartUploadCommand({
						Bucket: this.bucket,
						Key: this.key,
						UploadId: this.uploadId,
						MultipartUpload: {
							Parts: this.completedParts.sort(comparePartNumber),
						},
					})
				)
				.then(res => {
					console.log('Completed upload', res);
					this.emitter.emit('uploadComplete', { key: `${this.bucket}/${this.key}` });
				})
				.catch(err => {
					console.error('error completing upload', err);
				});
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
						Parts: this.completedParts.sort(comparePartNumber),
					},
				})
			)
			.then(res => {
				console.log('Completed upload', res);
				this.emitter.emit('uploadComplete', { key: `${this.bucket}/${this.key}` });
			})
			.catch(err => {
				console.error('error completing upload', err);
			});
	}

	private _isBlob(x: unknown): x is Blob {
		return typeof x !== 'undefined' && x instanceof Blob;
	}

	private _startNextPart() {
		console.log('starting the next part ...');
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
							...output,
							part: nextPart,
						});
						return output;
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

	public onComplete(fn) {
		this.onCompleteCallback = fn;
	}

	public onProgress(fn) {
		this.onProgressCallback = fn;
	}

	public start() {
		if (this.bytesUploaded > 0) {
			this.resume();
		} else {
			this.state = State.IN_PROGRESS;
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
			console.log('parts ', parts);
			this.queuedParts = parts;
			// If there are pre-existing completed parts, calculate the bytes uploaded
			if (this.uploadedPartsFromStorage) {
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
				if (this._isDone()) this._completeUpload();
			}
			for (let i = 0; i < this.queueSize; i++) {
				this._startNextPart();
			}
		}
	}

	public resume(): void {
		this.state = State.IN_PROGRESS;
		for (let i = 0; i < this.queueSize; i++) {
			this._startNextPart();
		}
	}

	public abort(): void {
		this.pause(true);
		this.queuedParts = [];
		this.completedParts = [];
		this.bytesUploaded = 0;
		this.state = State.PENDING;
	}

	/**
	 * pause this particular upload task
	 **/
	public pause(abort = false, message?: string): void {
		this.state = State.PAUSED;
		if (abort) {
			// use axios cancel token to abort the part request immediately
			// Add the inProgress parts back to pending
			this.inProgressRequest.forEach(req => {
				req.cancel(message);
			});
			this.queuedParts = this.inProgressRequest.map(request => request.uploadPartInput).concat(this.queuedParts);
			this.inProgressRequest = [];
		} else {
			// Wait for all inProgress jobs to finish
			Promise.all(
				this.inProgressRequest.map(req =>
					req.s3Request.then(output => {
						this.completedParts = this.completedParts.concat({
							PartNumber: req.uploadPartInput.PartNumber,
							ETag: output.ETag,
						});
					})
				)
			).then(() => {
				this.inProgressRequest = [];
			});
		}
	}
}
