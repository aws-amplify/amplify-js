import { AWSS3UploadTask } from './AWSS3UploadTask';
import * as events from 'events';
import {
	S3Client,
	ListPartsCommand,
	ListPartsCommandOutput,
	CreateMultipartUploadCommand,
	AbortMultipartUploadCommand,
	PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { StorageHelper, Logger, Hub } from '@aws-amplify/core';
import { StorageAccessLevel } from '../types/Storage';

const logger = new Logger('AWSS3UploadManager');
const oneHourInMs = 1000 * 60 * 60;

type UploadId = string;

export interface AddTaskInput {
	accessLevel: StorageAccessLevel;
	file: Blob;
	bucket: string;
	emitter: events.EventEmitter;
	key: string;
	s3Client: S3Client;
	params?: PutObjectCommandInput;
}

interface FileMetadata {
	bucket: string;
	fileName: string;
	key: string;
	// Unix timestamp in ms
	lastTouched: number;
	uploadId: UploadId;
}

export enum TaskEvents {
	ABORT = 'abort',
	UPLOAD_COMPLETE = 'uploadComplete',
	UPLOAD_PROGRESS = 'uploadPartProgress',
	ERROR = 'error',
}

export const UPLOADS_STORAGE_KEY = '__uploadInProgress';

export class AWSS3UploadManager {
	private readonly _storage: Storage;
	private readonly _uploadTasks: Record<UploadId, AWSS3UploadTask> = {};

	constructor() {
		this._storage = new StorageHelper().getStorage();
		Hub.listen('auth', data => {
			const { payload } = data;
			if (payload.event === 'signOut') {
				this._storage.removeItem(UPLOADS_STORAGE_KEY);
			}
		});
	}

	private _listUploadTasks(): Record<string, FileMetadata> | {} {
		const tasks = this._storage.getItem(UPLOADS_STORAGE_KEY);

		if (tasks) {
			return JSON.parse(tasks);
		}
		return {};
	}

	private _setUploadTasks(uploads: Record<string, FileMetadata> | {}): void {
		this._storage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(uploads));
	}

	private async _getCachedUploadParts({
		s3client,
		bucket,
		key,
		file,
	}: {
		s3client: S3Client;
		bucket: string;
		key: string;
		file: Blob;
	}): Promise<ListPartsCommandOutput | undefined> {
		const fileKey = this._getFileKey(file, bucket, key);

		// scan for expired multipart upload requests every time localStorage is queried
		await this._abortExpiredRequests({
			s3Client: s3client,
		});

		const uploads = this._listUploadTasks();

		if (Object.keys(uploads).length === 0 || !uploads.hasOwnProperty(fileKey)) {
			return undefined;
		}

		const cachedUploadFileData: FileMetadata = uploads[fileKey];

		if (cachedUploadFileData) {
			cachedUploadFileData.lastTouched = Date.now();

			this._setUploadTasks(uploads);

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
	 * @param blob - Blob that should be uploaded.
	 * @return unique key of the file.
	 */
	private _getFileKey(blob: Blob, bucket: string, key: string): string {
		// We should check if it's a File first because File is also instance of a Blob
		if (this._isFile(blob)) {
			return [
				blob.name,
				blob.lastModified,
				blob.size,
				blob.type,
				bucket,
				key,
			].join('-');
		} else if (this._isBlob(blob)) {
			return [blob.size, blob.type, bucket, key].join('-');
		} else return '';
	}

	/**
	 * Purge all keys from storage that were expired.
	 *
	 * @param [ttl] - [Specify how long since the task has started should it be considered expired]
	 */
	private async _abortExpiredRequests({
		s3Client,
		ttl = oneHourInMs,
	}: {
		s3Client: S3Client;
		ttl?: number;
	}) {
		const uploads = this._listUploadTasks();

		for (const [k, upload] of Object.entries(uploads)) {
			const hasExpired =
				Object.prototype.hasOwnProperty.call(upload, 'lastTouched') &&
				Date.now() - upload.lastTouched > ttl;

			if (hasExpired) {
				await s3Client.send(
					new AbortMultipartUploadCommand({
						Bucket: upload.bucket,
						Key: upload.key,
						UploadId: upload.uploadId,
					})
				);
				delete uploads[k];
			}
		}

		this._setUploadTasks(uploads);
	}

	private _removeKey(key: string) {
		const uploads = this._listUploadTasks();
		delete uploads[key];
		this._setUploadTasks(uploads);
	}

	private _isListPartsOutput(
		x: unknown
	): x is ListPartsCommandOutput & { UploadId: string } {
		return (
			x &&
			typeof x === 'object' &&
			Object.prototype.hasOwnProperty.call(x, 'UploadId') &&
			Object.prototype.hasOwnProperty.call(x, 'Parts')
		);
	}

	public async addTask(input: AddTaskInput) {
		const { s3Client, bucket, key, file, emitter } = input;
		let cachedUpload = {};

		try {
			cachedUpload =
				(await this._getCachedUploadParts({
					s3client: s3Client,
					bucket,
					key,
					file,
				})) || {};
		} catch (err) {
			logger.error(
				'Error finding cached upload parts, will re-initialize the multipart upload',
				err
			);
		}

		const fileKey = this._getFileKey(file, bucket, key);

		emitter.on(TaskEvents.UPLOAD_COMPLETE, () => {
			this._removeKey(fileKey);
		});

		emitter.on(TaskEvents.ABORT, () => {
			this._removeKey(fileKey);
		});

		if (this._isListPartsOutput(cachedUpload)) {
			const cachedUploadId = cachedUpload.UploadId;
			const existingTask = new AWSS3UploadTask({
				s3Client,
				uploadPartInput: {
					UploadId: cachedUploadId,
					Bucket: bucket,
					Key: key,
				},
				file,
				completedParts: cachedUpload.Parts,
				emitter,
			});

			this._uploadTasks[cachedUploadId] = existingTask;
			// Automatically start the upload
			existingTask.resume();

			return existingTask;
		}

		return this._initMultiupload(input);
	}

	private async _initMultiupload(input: AddTaskInput) {
		const { s3Client, bucket, key, file, emitter, params } = input;
		const fileKey = this._getFileKey(file as File, bucket, key);
		const createMultipartUpload = await s3Client.send(
			new CreateMultipartUploadCommand(params)
		);
		const newTask = new AWSS3UploadTask({
			s3Client,
			uploadPartInput: {
				UploadId: createMultipartUpload.UploadId,
				Key: key,
				Bucket: bucket,
			},
			file,
			emitter,
		});
		const fileMetadata: FileMetadata = {
			uploadId: createMultipartUpload.UploadId,
			lastTouched: Date.now(),
			bucket,
			key,
			...(this._isFile(file) && { fileName: file.name }),
		};

		this._uploadTasks[createMultipartUpload.UploadId] = newTask;
		this._addKey(fileKey, fileMetadata);
		newTask.resume();

		return newTask;
	}

	private _addKey(key: string, fileMetadata: FileMetadata) {
		const uploads = this._listUploadTasks();
		uploads[key] = fileMetadata;
		this._setUploadTasks(uploads);
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
