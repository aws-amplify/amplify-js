import {
	UploadPartCommandInput,
	CompletedPart,
	S3Client,
	UploadPartCommand,
	CompleteMultipartUploadCommand,
	Part,
	AbortMultipartUploadCommand,
	AbortMultipartUploadCommandOutput,
	ListPartsCommand,
	CreateMultipartUploadCommand,
	PutObjectCommandInput,
	ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import * as events from 'events';
import axios, { Canceler, CancelTokenSource } from 'axios';
import { HttpHandlerOptions } from '@aws-sdk/types';
import { Logger } from '@aws-amplify/core';
import { UploadTask } from '../types/Provider';
import { byteLength, isFile } from '../common/StorageUtils';
import { AWSS3ProviderUploadErrorStrings } from '../common/StorageErrorStrings';
import {
	SET_CONTENT_LENGTH_HEADER,
	UPLOADS_STORAGE_KEY,
} from '../common/StorageConstants';
import { StorageAccessLevel } from '..';

const logger = new Logger('AWSS3UploadTask');
export enum AWSS3UploadTaskState {
	INIT,
	IN_PROGRESS,
	PAUSED,
	CANCELLED,
	COMPLETED,
}

export enum TaskEvents {
	CANCEL = 'cancel',
	UPLOAD_COMPLETE = 'uploadComplete',
	UPLOAD_PROGRESS = 'uploadPartProgress',
	ERROR = 'error',
}

export interface AWSS3UploadTaskParams {
	s3Client: S3Client;
	file: Blob;
	storage: Storage;
	level: StorageAccessLevel;
	params: PutObjectCommandInput;
	emitter?: events.EventEmitter;
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
	/**
	 * bytes that has been sent to S3 so far
	 */
	loaded: number;
	/**
	 * total bytes that needs to be sent to S3
	 */
	total: number;
}

export interface FileMetadata {
	bucket: string;
	fileName: string;
	key: string;
	// Unix timestamp in ms
	lastTouched: number;
	uploadId: string;
}

// maximum number of parts per upload request according the S3 spec,
// see: https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html
const MAX_PARTS = 10000;
// 5MB in bytes
const PART_SIZE = 5 * 1024 * 1024;
const DEFAULT_QUEUE_SIZE = 4;

function comparePartNumber(a: CompletedPart, b: CompletedPart) {
	return a.PartNumber - b.PartNumber;
}

export class AWSS3UploadTask implements UploadTask {
	private readonly emitter: events.EventEmitter;
	private readonly file: Blob;
	private readonly partSize: number = PART_SIZE;
	private readonly queueSize = DEFAULT_QUEUE_SIZE;
	private readonly s3client: S3Client;
	private readonly storage: Storage;
	private readonly storageSync: Promise<any>;
	private readonly fileId: string;
	private readonly params: PutObjectCommandInput;
	private inProgress: InProgressRequest[] = [];
	private completedParts: CompletedPart[] = [];
	private queued: UploadPartCommandInput[] = [];
	private bytesUploaded: number = 0;
	private totalBytes: number = 0;
	private uploadId: string;

	public state: AWSS3UploadTaskState = AWSS3UploadTaskState.INIT;

	constructor({
		s3Client,
		file,
		emitter,
		storage,
		params,
		level,
	}: AWSS3UploadTaskParams) {
		this.s3client = s3Client;
		this.s3client.middlewareStack.remove(SET_CONTENT_LENGTH_HEADER);
		this.storage = storage;
		this.storageSync = Promise.resolve();
		if (typeof this.storage['sync'] === 'function') {
			this.storageSync = this.storage['sync']();
		}
		this.params = params;
		this.file = file;
		this.totalBytes = this.file.size;
		this.bytesUploaded = 0;
		this.emitter = emitter;
		this.queued = [];
		this.fileId = this._getFileId(level);
		this._validateParams();
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

	private async _listSingleFile({
		key,
		bucket,
	}: {
		key: string;
		bucket: string;
	}) {
		const listObjectRes = await this.s3client.send(
			new ListObjectsV2Command({
				Bucket: bucket,
				Prefix: key,
			})
		);
		const { Contents = [] } = listObjectRes;
		const obj = Contents.find(o => o.Key === key);
		return obj;
	}

	private _getFileId(level: StorageAccessLevel): string {
		// We should check if it's a File first because File is also instance of a Blob
		if (isFile(this.file)) {
			return [
				this.file.name,
				this.file.lastModified,
				this.file.size,
				this.file.type,
				this.params.Bucket,
				level,
				this.params.Key,
			].join('-');
		} else {
			return [
				this.file.size,
				this.file.type,
				this.params.Bucket,
				level,
				this.params.Key,
			].join('-');
		}
	}

	private async _findCachedUploadParts(): Promise<{
		parts: Part[];
		uploadId: string;
	}> {
		const uploadRequests = await this._listCachedUploadTasks();

		if (
			Object.keys(uploadRequests).length === 0 ||
			!Object.prototype.hasOwnProperty.call(uploadRequests, this.fileId)
		) {
			return { parts: [], uploadId: null };
		}

		const cachedUploadFileData = uploadRequests[this.fileId];
		cachedUploadFileData.lastTouched = Date.now();
		this.storage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(uploadRequests));

		const listPartsOutput = await this.s3client.send(
			new ListPartsCommand({
				Bucket: this.params.Bucket,
				Key: this.params.Key,
				UploadId: cachedUploadFileData.uploadId,
			})
		);

		return {
			parts: listPartsOutput.Parts || [],
			uploadId: cachedUploadFileData.uploadId,
		};
	}

	private _emitEvent<T = any>(event: string, payload: T) {
		this.emitter.emit(event, payload);
	}

	private _validateParams() {
		if (this.file.size / this.partSize > MAX_PARTS) {
			throw new Error(
				`Too many parts. Number of parts is ${this.file.size /
					this.partSize}, maximum is ${MAX_PARTS}.`
			);
		}
	}

	private async _listCachedUploadTasks(): Promise<
		Record<string, FileMetadata>
	> {
		await this.storageSync;
		const tasks = this.storage.getItem(UPLOADS_STORAGE_KEY) || '{}';
		return JSON.parse(tasks);
	}

	private async _cache(fileMetadata: FileMetadata): Promise<void> {
		const uploadRequests = await this._listCachedUploadTasks();
		uploadRequests[this.fileId] = fileMetadata;
		this.storage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(uploadRequests));
	}

	private async _isCached(): Promise<boolean> {
		return Object.prototype.hasOwnProperty.call(
			await this._listCachedUploadTasks(),
			this.fileId
		);
	}

	private async _removeFromCache(): Promise<void> {
		const uploadRequests = await this._listCachedUploadTasks();
		delete uploadRequests[this.fileId];
		this.storage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(uploadRequests));
	}

	private async _onPartUploadCompletion({
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
		this._emitEvent<UploadTaskProgressEvent>(TaskEvents.UPLOAD_PROGRESS, {
			loaded: this.bytesUploaded,
			total: this.totalBytes,
		});
		// Remove the completed item from the inProgress array
		this.inProgress = this.inProgress.filter(
			job => job.uploadPartInput.PartNumber !== partNumber
		);
		if (this.queued.length && this.state !== AWSS3UploadTaskState.PAUSED)
			this._startNextPart();
		if (this._isDone()) this._completeUpload();
	}

	private async _completeUpload() {
		try {
			await this.s3client.send(
				new CompleteMultipartUploadCommand({
					Bucket: this.params.Bucket,
					Key: this.params.Key,
					UploadId: this.uploadId,
					MultipartUpload: {
						// Parts are not always completed in order, we need to manually sort them
						Parts: this.completedParts.sort(comparePartNumber),
					},
				})
			);
			this._verifyFileSize();
			this._emitEvent<UploadTaskCompleteEvent>(TaskEvents.UPLOAD_COMPLETE, {
				key: `${this.params.Bucket}/${this.params.Key}`,
			});
			this._removeFromCache();
			this.state = AWSS3UploadTaskState.COMPLETED;
		} catch (err) {
			logger.error('error completing upload', err);
			this._emitEvent(TaskEvents.ERROR, err);
		}
	}

	private async _makeUploadPartRequest(
		input: UploadPartCommandInput,
		cancelTokenSource: CancelTokenSource
	) {
		try {
			const res = await this.s3client.send(new UploadPartCommand(input), {
				cancelTokenSource,
			} as HttpHandlerOptions);
			await this._onPartUploadCompletion({
				eTag: res.ETag,
				partNumber: input.PartNumber,
				chunk: input.Body,
			});
		} catch (err) {
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
				err.message !== AWSS3ProviderUploadErrorStrings.UPLOAD_PAUSED_MESSAGE
			) {
				this._emitEvent(TaskEvents.ERROR, err);
			}
			this.pause();
		}
	}

	private _startNextPart() {
		if (this.queued.length > 0 && this.state !== AWSS3UploadTaskState.PAUSED) {
			const cancelTokenSource = axios.CancelToken.source();
			const nextPart = this.queued.shift();
			this.inProgress.push({
				uploadPartInput: nextPart,
				s3Request: this._makeUploadPartRequest(nextPart, cancelTokenSource),
				cancel: cancelTokenSource.cancel,
			});
		}
	}

	/**
	 * Verify on S3 side that the file size matches the one on the client side.
	 *
	 * @async
	 * @throws throws an error if the file size does not match between local copy of the file and the file on s3.
	 */
	private async _verifyFileSize() {
		const obj = await this._listSingleFile({
			key: this.params.Key,
			bucket: this.params.Bucket,
		});
		const valid = Boolean(obj && obj.Size === this.file.size);
		if (!valid) {
			throw new Error(
				'File size does not match between local file and file on s3'
			);
		}
		return valid;
	}

	private _isDone() {
		return (
			!this.queued.length &&
			!this.inProgress.length &&
			this.bytesUploaded === this.totalBytes
		);
	}

	private _createParts() {
		const size = this.file.size;
		const parts: UploadPartCommandInput[] = [];
		for (let bodyStart = 0; bodyStart < size; ) {
			const bodyEnd = Math.min(bodyStart + this.partSize, size);
			parts.push({
				Body: this.file.slice(bodyStart, bodyEnd),
				Key: this.params.Key,
				Bucket: this.params.Bucket,
				PartNumber: parts.length + 1,
				UploadId: this.uploadId,
			});
			bodyStart += this.partSize;
		}
		return parts;
	}

	private _initCachedUploadParts(cachedParts: Part[]) {
		this.bytesUploaded += cachedParts.reduce((acc, part) => acc + part.Size, 0);
		// Find the set of part numbers that have already been uploaded
		const uploadedPartNumSet = new Set(
			cachedParts.map(part => part.PartNumber)
		);
		this.queued = this.queued.filter(
			part => !uploadedPartNumSet.has(part.PartNumber)
		);
		this.completedParts = cachedParts.map(part => ({
			PartNumber: part.PartNumber,
			ETag: part.ETag,
		}));
		this._emitEvent<UploadTaskProgressEvent>(TaskEvents.UPLOAD_PROGRESS, {
			loaded: this.bytesUploaded,
			total: this.totalBytes,
		});
	}

	private async _initMultipartUpload() {
		const res = await this.s3client.send(
			new CreateMultipartUploadCommand(this.params)
		);
		this._cache({
			uploadId: res.UploadId,
			lastTouched: Date.now(),
			bucket: this.params.Bucket,
			key: this.params.Key,
			fileName: this.file instanceof File ? this.file.name : '',
		});
		return res.UploadId;
	}

	private async _initializeUploadTask() {
		this.state = AWSS3UploadTaskState.IN_PROGRESS;
		try {
			if (await this._isCached()) {
				const { parts, uploadId } = await this._findCachedUploadParts();
				this.uploadId = uploadId;
				this.queued = this._createParts();
				this._initCachedUploadParts(parts);
				this._startUpload();
			} else {
				if (!this.uploadId) {
					const uploadId = await this._initMultipartUpload();
					this.uploadId = uploadId;
					this.queued = this._createParts();
					this._startUpload();
				}
			}
		} catch (err) {
			if (!axios.isCancel(err)) {
				logger.error('Error initializing the upload task', err);
			}
		}
	}

	public resume(): void {
		if (this.state === AWSS3UploadTaskState.CANCELLED) {
			logger.warn('This task has already been aborted');
		} else if (this.state === AWSS3UploadTaskState.COMPLETED) {
			logger.warn('This task has already been completed');
		} else if (this.state === AWSS3UploadTaskState.IN_PROGRESS) {
			logger.warn('Upload task already in progress');
			// first time running resume, find any cached parts on s3 or start a new multipart upload request before
			// starting the upload
		} else if (!this.uploadId) {
			this._initializeUploadTask();
		} else {
			this._startUpload();
		}
	}

	private _startUpload() {
		this.state = AWSS3UploadTaskState.IN_PROGRESS;
		for (let i = 0; i < this.queueSize; i++) {
			this._startNextPart();
		}
	}

	async _cancel(): Promise<boolean> {
		this.pause();
		this.queued = [];
		this.completedParts = [];
		this.bytesUploaded = 0;
		this.state = AWSS3UploadTaskState.CANCELLED;
		try {
			await this.s3client.send(
				new AbortMultipartUploadCommand({
					Bucket: this.params.Bucket,
					Key: this.params.Key,
					UploadId: this.uploadId,
				})
			);
			await this._removeFromCache();
			return true;
		} catch (err) {
			logger.error('Error cancelling upload task', err);
			return false;
		}
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
