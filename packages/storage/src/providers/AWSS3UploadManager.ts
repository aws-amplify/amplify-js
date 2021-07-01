import { AWSS3UploadTask } from './AWSS3UploadTask';
import * as events from 'events';
import { S3Client, ListPartsCommand, ListPartsCommandOutput, CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { StorageHelper } from '@aws-amplify/core';

const oneHourInMs = 1000 * 60 * 60;

type UploadId = string;

interface AddTaskInput {
	s3Client: S3Client;
	bucket: string;
	key: string;
	body: Blob;
	emitter?: events.EventEmitter;
}

interface FileMetadata {
	uploadId: UploadId;
	// in epoch
	timeStarted: number;
	bucket: string;
	key: string;
}

export enum TaskEvents {
	UPLOAD_COMPLETE = 'uploadComplete',
	ABORT = 'abort',
	UPLOAD_PROGRESS = 'uploadPartProgress',
}

const storageKey = '__uploadInProgress';

export class AWSS3UploadManager {
	private readonly _storage: Storage;
	private readonly _uploadTasks: Record<UploadId, AWSS3UploadTask> = {};

	constructor() {
		this._storage = new StorageHelper().getStorage();
	}

	private async getCachedUploadParts({
		s3client,
		bucket,
		key,
		body,
	}: {
		s3client: S3Client;
		bucket: string;
		key: string;
		body: Blob;
	}): Promise<ListPartsCommandOutput> {
		const uploadsFromStorage = this._storage.getItem(storageKey);
		if (!uploadsFromStorage) {
			return null;
		}
		const uploads = JSON.parse(uploadsFromStorage) || {};
		const fileKey = this._getFileKey(body, bucket, key);
		if (!Object.prototype.hasOwnProperty.call(uploads, fileKey)) {
			return null;
		}
		const cachedUploadFileData: FileMetadata = uploads[this._getFileKey(body, bucket, key)];
		const hasExpired =
			Object.prototype.hasOwnProperty.call(cachedUploadFileData, 'timeStarted') &&
			Date.now() - cachedUploadFileData.timeStarted > oneHourInMs;
		if (cachedUploadFileData && !hasExpired) {
			const listPartsOutput = await s3client.send(
				new ListPartsCommand({
					Bucket: bucket,
					Key: key,
					UploadId: cachedUploadFileData.uploadId,
				})
			);
			return listPartsOutput;
		}
	}

	/**
	 * Generate a unique key for the file.
	 *
	 * @param {Blob} blob - Blob that should be uploaded.
	 * @return {string} unique key of the file.
	 */
	private _getFileKey(blob: Blob, bucket: string, key: string): string {
		// We should check if it's a File first because File is also instance of a Blob
		if (this._isFile(blob)) {
			return [blob.name, blob.lastModified, blob.size, blob.type, bucket, key].join('-');
		} else if (this._isBlob(blob)) {
			return [blob.size, blob.type, bucket, key].join('-');
		} else return '';
	}

	/**
	 * Purge all keys from storage that were expired.
	 *
	 * @param [ttl] - [Specify how long since the task has started should it be considered expired]
	 */
	private _purgeExpiredKeys(ttl = oneHourInMs): void {
		const uploads = JSON.parse(this._storage.getItem(storageKey)) || {};
		for (const [k, v] of Object.entries(uploads)) {
			const hasExpired =
				Object.prototype.hasOwnProperty.call(v, 'timeStarted') && Date.now() - (v as any).timeStarted > ttl;
			console.log(`${k} : ${JSON.stringify(v)}`);
			if (hasExpired) {
				// TODO: Clean up parts on S3 while purging
				console.log(`Purging ${k}`);
				delete uploads[k];
			}
		}
		this._storage.setItem(storageKey, JSON.stringify(uploads));
	}

	private _removeKey(key: string) {
		console.log(`Removing ${key}`);
		const uploads = JSON.parse(this._storage.getItem(storageKey)) || {};
		delete uploads[key];
		this._storage.setItem(storageKey, JSON.stringify(uploads));
	}

	private _isListPartsOutput(x: unknown): x is ListPartsCommandOutput {
		return x && Object.prototype.hasOwnProperty.call(x, 'UploadId') && Object.prototype.hasOwnProperty.call(x, 'Parts');
	}

	public async addTask(input: AddTaskInput) {
		const { s3Client, bucket, key, body, emitter } = input;
		let cachedUpload = {};
		this._purgeExpiredKeys();
		try {
			console.log('Finding cached upload parts');
			cachedUpload = (await this.getCachedUploadParts({ s3client: s3Client, bucket, key, body })) || {};
		} catch (err) {
			console.error('Error finding cached upload parts, re-intializing the multipart upload');
		}
		const fileKey = this._getFileKey(body, bucket, key);
		emitter.on(TaskEvents.UPLOAD_COMPLETE, () => {
			this._removeKey(fileKey);
		});
		emitter.on(TaskEvents.ABORT, () => {
			this._removeKey(fileKey);
		});
		if (this._isListPartsOutput(cachedUpload)) {
			const cachedUploadId = cachedUpload.UploadId;
			const uploadedPartsOnS3 = cachedUpload.Parts;
			console.log('Found cached upload parts', uploadedPartsOnS3);
			this._uploadTasks[cachedUploadId] = new AWSS3UploadTask({
				s3Client,
				uploadId: cachedUpload.UploadId,
				bucket,
				key,
				body,
				completedParts: cachedUpload.Parts,
				emitter,
			});
			return this._uploadTasks[cachedUploadId];
		} else {
			return this._initMultiupload(input);
		}
	}

	private async _initMultiupload(input: AddTaskInput) {
		console.log('cached upload not found, creating a new one');
		const { s3Client, bucket, key, body, emitter } = input;
		const fileKey = this._getFileKey(body as File, bucket, key);
		const createMultipartUpload = await s3Client.send(
			new CreateMultipartUploadCommand({
				Bucket: bucket,
				Key: key,
			})
		);
		const newTask = new AWSS3UploadTask({
			s3Client,
			uploadId: createMultipartUpload.UploadId,
			bucket,
			key,
			body,
			emitter,
		});
		this._uploadTasks[createMultipartUpload.UploadId] = newTask;
		const fileMetadata: FileMetadata = {
			uploadId: createMultipartUpload.UploadId,
			timeStarted: Date.now(),
			bucket,
			key,
		};
		this._addKey(fileKey, fileMetadata);
		return newTask;
	}

	private _addKey(key: string, fileMetadata: FileMetadata) {
		const uploads = JSON.parse(this._storage.getItem(storageKey)) || {};
		uploads[key] = fileMetadata;
		this._storage.setItem(storageKey, JSON.stringify(uploads));
	}

	public getTask(uploadId: UploadId) {
		return this._uploadTasks[uploadId];
	}

	private _isBlob(x: unknown): x is Blob {
		return x instanceof Blob;
	}

	private _isFile(x: unknown): x is File {
		return x instanceof File;
	}
}
