import { AWSS3UploadTask } from './AWSS3UploadTask';
import * as events from 'events';
import { S3Client, ListPartsCommand, ListPartsCommandOutput, CreateMultipartUploadCommand } from '@aws-sdk/client-s3';

type UploadId = string;

interface AddTaskInput {
	s3Client: S3Client;
	bucket: string;
	key: string;
	body: Blob;
}

const uploadComplete = 'uploadComplete';

export class AWSS3UploadManager {
	private readonly _emitter: events.EventEmitter = new events.EventEmitter();
	private readonly _session: Storage = window.sessionStorage;
	private readonly _uploadTasks: Record<UploadId, AWSS3UploadTask> = {};

	constructor(emitter?: events.EventEmitter) {
		this._emitter = emitter;
		this._emitter.on(uploadComplete, event => {
			this._session.removeItem(event.key);
		});
	}

	private async getCachedUploadParts(s3client: S3Client, bucket: string, key: string): Promise<ListPartsCommandOutput> {
		const cachedUploadId = this._session.getItem(`${bucket}/${key}`);
		if (cachedUploadId) {
			const listPartsOutput = await s3client.send(
				new ListPartsCommand({
					Bucket: bucket,
					Key: key,
					UploadId: cachedUploadId,
				})
			);
			return listPartsOutput;
		}
	}

	public listUploads({ s3Client }) {
		const cached = Object.entries(this._session);
		for (const [fileName, uploadId] of cached) {
			console.log(fileName);
			const bucket = fileName.split('/')[0];
			const key = fileName.split('/').slice(1).join('/');
			this.getCachedUploadParts(s3Client, bucket, key).then(output => {
				console.log(output);
			});
		}
	}

	public async addTask({ s3Client, bucket, key, body }: AddTaskInput) {
		const sessionKey = `${bucket}/${key}`;
		let storedInS3 = {};
		try {
			console.log('Finding cached upload parts');
			storedInS3 = (await this.getCachedUploadParts(s3Client, bucket, key)) || {};
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
				emitter: this._emitter,
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
				emitter: this._emitter,
			});
			this._uploadTasks[createMultipartUpload.UploadId] = newTask;
			this._session.setItem(sessionKey, createMultipartUpload.UploadId);
			return newTask;
		}
	}

	public getTask(uploadId: UploadId) {
		return this._uploadTasks[uploadId];
	}
}
