// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as events from 'events';
import { Logger } from '@aws-amplify/core';
import { UploadTask } from '../types/Provider';
import {
	PutObjectInput,
	createMultipartUpload,
	uploadPart,
	UploadPartInput,
	listObjectsV2,
	CompletedPart,
	Part,
	listParts,
	completeMultipartUpload,
	abortMultipartUpload,
} from '../AwsClients/S3';
import { isCancelError, CANCELED_ERROR_MESSAGE } from '../AwsClients/S3/utils';
import {
	calculatePartSize,
	DEFAULT_PART_SIZE,
	DEFAULT_QUEUE_SIZE,
	MAX_OBJECT_SIZE,
	S3ResolvedConfig,
} from '../common/S3ClientUtils';
import { byteLength, isFile } from '../common/StorageUtils';
import { UPLOADS_STORAGE_KEY } from '../common/StorageConstants';
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
	s3Config: S3ResolvedConfig;
	file: Blob;
	storage: Storage;
	level: StorageAccessLevel;
	params: PutObjectInput;
	prefixPromise: Promise<string>;
	emitter?: events.EventEmitter;
}

export interface InProgressRequest {
	uploadPartInput: UploadPartInput;
	s3Request: Promise<any>;
	abortController: AbortController;
}

export interface UploadTaskCompleteEvent {
	key?: string;
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

function comparePartNumber(a: CompletedPart, b: CompletedPart) {
	return a.PartNumber - b.PartNumber;
}

export class AWSS3UploadTask implements UploadTask {
	private readonly emitter: events.EventEmitter;
	private readonly file: Blob;
	private readonly queueSize = DEFAULT_QUEUE_SIZE;
	private readonly s3Config: S3ResolvedConfig;
	private readonly storage: Storage;
	private readonly storageSync: Promise<any>;
	private readonly fileId: string;
	private readonly params: PutObjectInput;
	private readonly prefixPromise: Promise<string>;
	private partSize: number = DEFAULT_PART_SIZE;
	private inProgress: InProgressRequest[] = [];
	private completedParts: CompletedPart[] = [];
	private queued: UploadPartInput[] = [];
	private bytesUploaded: number = 0;
	private totalBytes: number = 0;
	private uploadId: string;

	public state: AWSS3UploadTaskState = AWSS3UploadTaskState.INIT;

	constructor({
		s3Config,
		file,
		emitter,
		storage,
		params,
		level,
		prefixPromise,
	}: AWSS3UploadTaskParams) {
		this.prefixPromise = prefixPromise;
		this.s3Config = s3Config;
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
		const objectKeyPrefix = await this.prefixPromise;
		const { Contents = [] } = await listObjectsV2(this.s3Config, {
			Bucket: bucket,
			Prefix: objectKeyPrefix + key,
		});
		const obj = Contents.find(o => o.Key === `${objectKeyPrefix}${key}`);
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

		const { Parts = [] } = await listParts(this.s3Config, {
			Bucket: this.params.Bucket,
			Key: (await this.prefixPromise) + this.params.Key,
			UploadId: cachedUploadFileData.uploadId,
		});

		return {
			parts: Parts,
			uploadId: cachedUploadFileData.uploadId,
		};
	}

	private _emitEvent<T = any>(event: string, payload: T) {
		this.emitter.emit(event, payload);
	}

	private _validateParams() {
		if (this.totalBytes > MAX_OBJECT_SIZE) {
			throw new Error(
				`File size bigger than S3 Object limit of 5TB, got ${this.totalBytes} Bytes`
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
		chunk: UploadPartInput['Body'];
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
			await completeMultipartUpload(this.s3Config, {
				Bucket: this.params.Bucket,
				Key: (await this.prefixPromise) + this.params.Key,
				UploadId: this.uploadId,
				MultipartUpload: {
					// Parts are not always completed in order, we need to manually sort them
					Parts: [...this.completedParts].sort(comparePartNumber),
				},
			});
			await this._verifyFileSize();
			this._emitEvent<UploadTaskCompleteEvent>(TaskEvents.UPLOAD_COMPLETE, {
				key: this.params.Key,
			});
			this._removeFromCache();
			this.state = AWSS3UploadTaskState.COMPLETED;
		} catch (err) {
			logger.error('error completing upload', err);
			this._emitEvent(TaskEvents.ERROR, err);
		}
	}

	private async _makeUploadPartRequest(
		input: UploadPartInput,
		abortSignal: AbortSignal
	) {
		try {
			const res = await uploadPart(
				{
					...this.s3Config,
					abortSignal,
				},
				{
					...input,
					Key: (await this.prefixPromise) + this.params.Key,
				}
			);
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
			// xhr transfer handlers' cancel will also throw an error, however we don't need to emit an event in that case as it's an
			// expected behavior
			if (!isCancelError(err) && err.message !== CANCELED_ERROR_MESSAGE) {
				this._emitEvent(TaskEvents.ERROR, err);
				this.pause();
			}
		}
	}

	private _startNextPart() {
		if (this.queued.length > 0 && this.state !== AWSS3UploadTaskState.PAUSED) {
			const abortController = new AbortController();
			const nextPart = this.queued.shift();
			this.inProgress.push({
				uploadPartInput: nextPart,
				s3Request: this._makeUploadPartRequest(
					nextPart,
					abortController.signal
				),
				abortController,
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
		let valid: boolean;
		try {
			const obj = await this._listSingleFile({
				key: this.params.Key,
				bucket: this.params.Bucket,
			});
			valid = Boolean(obj && obj.Size === this.file.size);
		} catch (e) {
			logger.log('Could not get file on s3 for size matching: ', e);
			// Don't gate verification on auth or other errors
			// unrelated to file size verification
			return;
		}

		if (!valid) {
			throw new Error(
				'File size does not match between local file and file on s3'
			);
		}
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
		const parts: UploadPartInput[] = [];
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
		const res = await createMultipartUpload(this.s3Config, {
			...this.params,
			Key: (await this.prefixPromise) + this.params.Key,
		});
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
		this.partSize = calculatePartSize(this.totalBytes);
		try {
			if (await this._isCached()) {
				const { parts, uploadId } = await this._findCachedUploadParts();
				this.uploadId = uploadId;
				this.queued = this._createParts();
				this._initCachedUploadParts(parts);
				if (this._isDone()) {
					this._completeUpload();
				} else {
					this._startUpload();
				}
			} else {
				if (!this.uploadId) {
					const uploadId = await this._initMultipartUpload();
					this.uploadId = uploadId;
					this.queued = this._createParts();
					this._startUpload();
				}
			}
		} catch (err) {
			if (!isCancelError(err)) {
				logger.error('Error initializing the upload task', err);
				this._emitEvent(TaskEvents.ERROR, err);
			}
		}
	}

	public resume(): void {
		if (this.state === AWSS3UploadTaskState.CANCELLED) {
			logger.warn('This task has already been cancelled');
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
		if (this.state === AWSS3UploadTaskState.CANCELLED) {
			logger.warn('This task has already been cancelled');
			return false;
		} else if (this.state === AWSS3UploadTaskState.COMPLETED) {
			logger.warn('This task has already been completed');
			return false;
		} else {
			this.pause();
			this.queued = [];
			this.completedParts = [];
			this.bytesUploaded = 0;
			this.state = AWSS3UploadTaskState.CANCELLED;
			try {
				await abortMultipartUpload(this.s3Config, {
					Bucket: this.params.Bucket,
					Key: (await this.prefixPromise) + this.params.Key,
					UploadId: this.uploadId,
				});
				await this._removeFromCache();
				return true;
			} catch (err) {
				logger.error('Error cancelling upload task', err);
				return false;
			}
		}
	}

	/**
	 * pause this particular upload task
	 **/
	public pause(): void {
		if (this.state === AWSS3UploadTaskState.CANCELLED) {
			logger.warn('This task has already been cancelled');
		} else if (this.state === AWSS3UploadTaskState.COMPLETED) {
			logger.warn('This task has already been completed');
		} else if (this.state === AWSS3UploadTaskState.PAUSED) {
			logger.warn('This task is already paused');
		}
		this.state = AWSS3UploadTaskState.PAUSED;
		// Abort the part request immediately
		// Add the inProgress parts back to pending
		const removedInProgressReq = this.inProgress.splice(
			0,
			this.inProgress.length
		);
		removedInProgressReq.forEach(req => {
			req.abortController.abort();
		});
		// Put all removed in progress parts back into the queue
		this.queued.unshift(
			...removedInProgressReq.map(req => req.uploadPartInput)
		);
	}
}
