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
}

const uploadComplete = 'uploadComplete';
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
		const uploads = JSON.parse(uploadsFromStorage);
		const cachedUploadFileData: FileMetadata = uploads[this._getFileKey(body)];
		const hasExpired =
			Object.prototype.hasOwnProperty.call(cachedUploadFileData, 'timeStarted') &&
			Date.now() - cachedUploadFileData.timeStarted > oneHourInMs;
		// Only return the cached parts on S3 if the file hasn't been modified, else we should re-intialize the upload
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

	private _getFileKey(blob: Blob) {
		if (this._isFile(blob)) {
			return [blob.name, blob.lastModified, blob.size, blob.type].join('-');
		} else if (this._isBlob(blob)) {
			return [blob.size, blob.type].join('-');
		} else return '';
	}

	private _purgeExpiredKeys() {
		const uploads = JSON.parse(this._storage.getItem(storageKey));
		for (const [k, v] of Object.entries(uploads)) {
			const hasExpired =
				Object.prototype.hasOwnProperty.call(v, 'timeStarted') && Date.now() - (v as any).timeStarted > oneHourInMs;
			console.log(`${k} : ${JSON.stringify(v)}`);
			if (hasExpired) {
				// TODO: Clean up parts on S3 while purging
				console.log(`Purging ${k}`);
				delete uploads[k];
			}
		}
		this._storage.setItem(storageKey, JSON.stringify(uploads));
	}

	public async addTask(input: AddTaskInput) {
		const { s3Client, bucket, key, body, emitter } = input;
		let cachedData = {};
		this._purgeExpiredKeys();
		try {
			console.log('Finding cached upload parts');
			cachedData = (await this.getCachedUploadParts({ s3client: s3Client, bucket, key, body: body })) || {};
		} catch (err) {
			console.error('Error finding cached upload parts, re-intializing the multipart upload');
		}
		if (Object.prototype.hasOwnProperty.call(cachedData, 'UploadId')) {
			const cachedUploadId = (cachedData as ListPartsCommandOutput).UploadId;
			const uploadedPartsOnS3 = (cachedData as ListPartsCommandOutput).Parts;
			console.log('Found cached upload parts', uploadedPartsOnS3);
			this._uploadTasks[cachedUploadId] = new AWSS3UploadTask({
				s3Client,
				uploadId: cachedUploadId,
				bucket,
				key,
				body,
				completedParts: uploadedPartsOnS3,
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
		const fileKey = this._getFileKey(body as File);
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
		emitter.on(uploadComplete, event => {
			this._storage.removeItem(event.key);
		});
		this._uploadTasks[createMultipartUpload.UploadId] = newTask;
		const fileMetadata: FileMetadata = {
			uploadId: createMultipartUpload.UploadId,
			timeStarted: Date.now(),
		};
		const uploads = JSON.parse(this._storage.getItem(storageKey)) || {};
		uploads[fileKey] = fileMetadata;
		this._storage.setItem(storageKey, JSON.stringify(uploads));
		return newTask;
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
