import { AWSS3UploadTask } from './AWSS3UploadTask';
import * as events from 'events';
import { S3Client, ListPartsCommand, ListPartsCommandOutput, CreateMultipartUploadCommand } from '@aws-sdk/client-s3';

type UploadId = string;

interface AddTaskInput {
	s3Client: S3Client;
	bucket: string;
	key: string;
	body: Blob;
	emitter?: events.EventEmitter;
}

const uploadComplete = 'uploadComplete';

export class AWSS3UploadManager {
	private readonly _storage: Storage;
	private readonly _uploadTasks: Record<UploadId, AWSS3UploadTask> = {};

	constructor() {
		this._storage = window.sessionStorage;
	}

	private async getCachedUploadParts({
		s3client,
		bucket,
		key,
		lastModified = 0,
	}: {
		s3client: S3Client;
		bucket: string;
		key: string;
		lastModified?: number;
	}): Promise<ListPartsCommandOutput> {
		const cachedUploadFileData = JSON.parse(this._storage.getItem(`${bucket}/${key}`));
		const hasModified =
			Object.prototype.hasOwnProperty.call(cachedUploadFileData, 'lastModified') &&
			lastModified > cachedUploadFileData.lastModified;
		// Only return the cached parts on S3 if the file hasn't been modified, else we should re-intialize the upload
		if (!hasModified && cachedUploadFileData) {
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

	public async addTask({ s3Client, bucket, key, body, emitter }: AddTaskInput) {
		const sessionKey = `${bucket}/${key}`;
		let cachedData = {};
		try {
			// Find lastModified of the file if possible
			const lastModified = body instanceof File ? body.lastModified : 0;
			console.log('Finding cached upload parts');
			cachedData = (await this.getCachedUploadParts({ s3client: s3Client, bucket, key, lastModified })) || {};
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
			console.log('cached upload not found, creating a new one');
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
			const fileData = {
				uploadId: createMultipartUpload.UploadId,
				...(body instanceof File && { lastModified: body.lastModified }),
			};
			this._storage.setItem(sessionKey, JSON.stringify(fileData));
			return newTask;
		}
	}

	public getTask(uploadId: UploadId) {
		return this._uploadTasks[uploadId];
	}
}
