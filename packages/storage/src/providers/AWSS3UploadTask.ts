import {
	UploadPartCommandInput,
	CompletedPart,
	S3Client,
	UploadPartCommand,
	CompleteMultipartUploadCommand,
	Part,
	AbortMultipartUploadCommand,
	AbortMultipartUploadCommandOutput,
} from '@aws-sdk/client-s3';
import * as events from 'events';
import axios, { Canceler } from 'axios';
import { HttpHandlerOptions } from '@aws-sdk/types';
import { Logger } from '@aws-amplify/core';
import { TaskEvents } from './AWSS3UploadManager';
import { UploadTask } from '../types/Provider';
import { listSingleFile, byteLength } from '../common/StorageUtils';
import { AWSS3ProviderUploadErrorStrings } from '../common/StorageErrorStrings';
import { SET_CONTENT_LENGTH_HEADER } from '../common/StorageConstants';

const logger = new Logger('AWSS3Provider');
export enum AWSS3UploadTaskState {
	INIT,
	IN_PROGRESS,
	PAUSED,
	CANCELLED,
}

type PartialUploadPartInput = Omit<UploadPartCommandInput, 'PartNumber'> &
	Partial<Pick<UploadPartCommandInput, 'PartNumber'>>;

export interface AWSS3UploadTaskParams {
	s3Client: S3Client;
	file: Blob;
	/**
	 * File size of each chunk of the parts
	 */
	partSize?: number;
	/**
	 * Completed Parts from an existing multipart upload
	 */
	completedParts?: Part[];
	emitter?: events.EventEmitter;
	uploadPartInput: PartialUploadPartInput;
}

export interface InProgressRequest {
	uploadPartInput: UploadPartCommandInput;
	s3Request: Promise<any>;
	cancel: Canceler;
}

export interface UploadTaskCompleteEvent {
	key: string;
}

export interface UploadTaskProgressEvent {
	loaded: number;
	total: number;
}

const MAX_PARTS = 10000;
const PART_SIZE = 5 * 1024 * 1024;
const DEFAULT_QUEUE_SIZE = 4;

function comparePartNumber(a: CompletedPart, b: CompletedPart) {
	return a.PartNumber - b.PartNumber;
}

export class AWSS3UploadTask implements UploadTask {
	private readonly emitter: events.EventEmitter;
	private readonly file: Blob;
	private readonly partSize: number;
	private readonly queueSize = DEFAULT_QUEUE_SIZE;
	private readonly s3client: S3Client;
	private inProgress: InProgressRequest[] = [];
	private completedParts: CompletedPart[] = [];
	private cachedParts: Part[] = [];
	private queued: UploadPartCommandInput[] = [];
	private bytesUploaded: number = 0;
	private totalBytes: number = 0;

	readonly bucket: string;
	readonly key: string;
	readonly uploadId: string;

	public state: AWSS3UploadTaskState = AWSS3UploadTaskState.INIT;

	constructor({
		s3Client,
		uploadPartInput,
		file,
		completedParts,
		emitter,
	}: AWSS3UploadTaskParams) {
		this.s3client = s3Client;
		this.s3client.middlewareStack.remove(SET_CONTENT_LENGTH_HEADER);
		this.uploadId = uploadPartInput.UploadId;
		this.bucket = uploadPartInput.Bucket;
		this.key = uploadPartInput.Key;
		this.file = file;
		this.partSize = PART_SIZE;
		this.totalBytes = this.file.size;
		this.bytesUploaded = 0;
		this.emitter = emitter;
		this.cachedParts = completedParts || [];
		this.queued = this._createParts();
		this._validateParams();
		if (this.cachedParts) {
			this._initCachedUploadParts();
		}
		// event emitter will re-throw an error if an event emits an error unless there's a listener, attaching a no-op
		// function to it unless user adds their own onError callback
		this.emitter.on(TaskEvents.ERROR, () => {});
	}

	get percent() {
		return (this.bytesUploaded / this.totalBytes) * 100;
	}

	get isInProgress() {
		return this.state === AWSS3UploadTaskState.IN_PROGRESS;
	}

	private _validateParams() {
		if (typeof this.uploadId !== 'string') {
			throw new Error(
				'UploadId must be specified and should be a string for an upload task'
			);
		}
		if (this.file.size / this.partSize > MAX_PARTS) {
			throw new Error('Too many parts');
		}
	}

	private _onPartUploadCompletion({
		eTag,
		partNumber,
		chunk,
	}: {
		eTag: string;
		partNumber: number;
		chunk: UploadPartCommandInput['Body'];
	}) {
		this.completedParts.push({
			ETag: eTag,
			PartNumber: partNumber,
		});
		this.bytesUploaded += byteLength(chunk);
		this.emitter.emit(TaskEvents.UPLOAD_PROGRESS, {
			loaded: this.bytesUploaded,
			total: this.totalBytes,
		});
		// Remove the completed item from the inProgress array
		this.inProgress = this.inProgress.filter(
			job => job.uploadPartInput.PartNumber !== partNumber
		);
		if (this.queued.length && this.state !== AWSS3UploadTaskState.PAUSED)
			this._startNextPart();
		if (this._isDone()) {
			this._completeUpload();
			this._verifyFileSize();
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
			.then(_res => {
				this.emitter.emit(TaskEvents.UPLOAD_COMPLETE, {
					key: `${this.bucket}/${this.key}`,
				});
			})
			.catch(err => {
				logger.error('error completing upload', err);
			});
	}

	private _startNextPart() {
		if (this.queued.length > 0 && this.state !== AWSS3UploadTaskState.PAUSED) {
			const cancelTokenSource = axios.CancelToken.source();
			const nextPart = this.queued.shift();
			this.inProgress.push({
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
						if (this.state === AWSS3UploadTaskState.PAUSED) {
							logger.log('upload paused');
						} else if (this.state === AWSS3UploadTaskState.CANCELLED) {
							logger.log('upload aborted');
						} else {
							logger.error('error starting next part of upload: ', err);
						}
						// axios' cancel will also throw an error, however we don't need to emit an event in that case as it's an
						// expected behavior
						if (
							!axios.isCancel(err) &&
							err.message !==
								AWSS3ProviderUploadErrorStrings.UPLOAD_PAUSED_MESSAGE
						) {
							this.emitter.emit(TaskEvents.ERROR, err);
						}
						this.pause();
					}),
				cancel: cancelTokenSource.cancel,
			});
		}
	}

	/**
	 * Verify on S3 side that the file size matches the one on the client side.
	 *
	 * @async
	 * @return {Promise<boolean>} If the local file size matches the one on S3.
	 */
	private async _verifyFileSize(): Promise<boolean> {
		const obj = await listSingleFile({
			s3Client: this.s3client,
			key: this.key,
			bucket: this.bucket,
		});
		return Boolean(obj && obj.Size === this.file.size);
	}

	private _isDone() {
		return !this.queued.length && !this.inProgress.length;
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
		this.bytesUploaded += this.cachedParts.reduce(
			(acc, part) => acc + part.Size,
			0
		);
		// Find the set of part numbers that have already been uploaded
		const uploadedPartNumSet = new Set(
			this.cachedParts.map(part => part.PartNumber)
		);
		this.queued = this.queued.filter(
			part => !uploadedPartNumSet.has(part.PartNumber)
		);
		this.completedParts = this.cachedParts.map(part => ({
			PartNumber: part.PartNumber,
			ETag: part.ETag,
		}));
		this.emitter.emit(TaskEvents.UPLOAD_PROGRESS, {
			loaded: this.bytesUploaded,
			total: this.totalBytes,
		});
	}

	public resume(): void {
		if (this.state === AWSS3UploadTaskState.CANCELLED) {
			throw new Error('This task has already been aborted');
		} else if (this.bytesUploaded === this.totalBytes) {
			logger.warn('This task has already been completed');
		} else if (this.state === AWSS3UploadTaskState.IN_PROGRESS) {
			logger.warn('Upload task already in progress');
		} else {
			this.state = AWSS3UploadTaskState.IN_PROGRESS;
			for (let i = 0; i < this.queueSize; i++) {
				this._startNextPart();
			}
		}
	}

	public cancel(): Promise<AbortMultipartUploadCommandOutput> {
		this.pause();
		this.queued = [];
		this.completedParts = [];
		this.bytesUploaded = 0;
		this.state = AWSS3UploadTaskState.CANCELLED;
		this.emitter.emit(TaskEvents.ABORT);
		return this.s3client.send(
			new AbortMultipartUploadCommand({
				Bucket: this.bucket,
				Key: this.key,
				UploadId: this.uploadId,
			})
		);
	}

	/**
	 * pause this particular upload task
	 **/
	public pause(): void {
		this.state = AWSS3UploadTaskState.PAUSED;
		// Use axios cancel token to abort the part request immediately
		// Add the inProgress parts back to pending
		const removedInProgressReq = this.inProgress.splice(
			0,
			this.inProgress.length
		);
		removedInProgressReq.forEach(req => {
			req.cancel(AWSS3ProviderUploadErrorStrings.UPLOAD_PAUSED_MESSAGE);
		});
		// Put all removed in progress parts back into the queue
		this.queued.unshift(
			...removedInProgressReq.map(req => req.uploadPartInput)
		);
	}
}
