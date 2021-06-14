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

	public listUploads({ s3Client }) {
		const cached = Object.entries(this._storage);
		for (const [fileName, uploadId] of cached) {
			console.log(fileName);
			const bucket = fileName.split('/')[0];
			const key = fileName.split('/').slice(1).join('/');
			this.getCachedUploadParts({ s3client: s3Client, bucket, key }).then(output => {
				console.log(output);
			});
		}
	}

	public async addTask({ s3Client, bucket, key, body, emitter }: AddTaskInput) {
		const sessionKey = `${bucket}/${key}`;
		let storedInS3 = {};
		try {
			console.log('Finding cached upload parts');
			storedInS3 = (await this.getCachedUploadParts({ s3client: s3Client, bucket, key })) || {};
		} catch (err) {
			console.error('Error finding cached upload parts, re-intializing the multipart upload');
		}
		if (Object.prototype.hasOwnProperty.call(storedInS3, 'UploadId')) {
			const cachedUploadId = (storedInS3 as ListPartsCommandOutput).UploadId;
			const uploadedPartsOnS3 = (storedInS3 as ListPartsCommandOutput).Parts;
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
