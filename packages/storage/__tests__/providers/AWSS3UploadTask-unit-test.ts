import {
	AWSS3UploadTask,
	AWSS3UploadTaskState,
	AWSS3UploadTaskParams,
} from '../../src/providers/AWSS3UploadTask';
import * as events from 'events';
import {
	S3Client,
	AbortMultipartUploadCommand,
	ListPartsCommand,
	CreateMultipartUploadCommand,
	ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { StorageAccessLevel, FileMetadata } from '../../src/types';
import { UPLOADS_STORAGE_KEY } from '../../src/common/StorageConstants';

afterEach(() => {
	jest.clearAllMocks();
});

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

const testOpts: any = {
	bucket: 'testBucket',
	region: 'testRegion',
	credentials,
	level: 'level',
};

let mockLocalStorageItems = {};

const mockLocalStorage = {
	getItem: jest.fn().mockImplementation((key) => mockLocalStorageItems[key]),
	setItem: jest.fn().mockImplementation((key, value) => {
		mockLocalStorageItems[key] = value;
	}),
	clear: jest.fn().mockImplementation(() => {
		mockLocalStorageItems = {};
	}),
	removeItem: jest.fn().mockImplementation((key) => {
		mockLocalStorageItems[key] = undefined;
	}),
} as unknown as Storage;

describe('resumable upload task test', () => {
	afterEach(() => {
		jest.clearAllMocks();
		mockLocalStorage.clear();
	});

	test('constructor test', () => {
		const file = new File(['TestFileContent'], 'testFileName');
		const emitter = new events.EventEmitter();
		const input: AWSS3UploadTaskParams = {
			file,
			s3Client: new S3Client(testOpts),
			emitter: emitter,
			storage: mockLocalStorage,
			level: 'public' as StorageAccessLevel,
			params: {
				Bucket: 'bucket',
				Key: 'key',
			},
			prefixPromise: Promise.resolve('prefix'),
		};
		const uploadTask = new AWSS3UploadTask(input);
		expect(uploadTask.isInProgress).toBeFalsy();
	});

	test('pause, resume, cancel should set the task state accordingly', async () => {
		const file = new File(['TestFileContent'], 'testFileName');
		Object.defineProperty(file, 'size', { value: 25048576 });
		const emitter = new events.EventEmitter();
		const input: AWSS3UploadTaskParams = {
			file,
			s3Client: new S3Client(testOpts),
			emitter: emitter,
			storage: mockLocalStorage,
			level: 'public' as StorageAccessLevel,
			params: {
				Bucket: 'bucket',
				Key: 'key',
			},
			prefixPromise: Promise.resolve('prefix'),
		};
		jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(async (command) => {
				if (command instanceof AbortMultipartUploadCommand) {
					return Promise.resolve({ Key: input.params.Key });
				} else if (command instanceof ListObjectsV2Command) {
					return Promise.resolve({
						Contents: [{ Key: input.params.Key, Size: 25048576 }],
					});
				}
			});
		const uploadTask = new AWSS3UploadTask(input);
		expect(uploadTask.percent).toEqual(0);
		expect(uploadTask.state).toEqual(AWSS3UploadTaskState.INIT);
		uploadTask.resume();
		expect(uploadTask.state).toEqual(AWSS3UploadTaskState.IN_PROGRESS);
		expect(uploadTask.isInProgress).toBe(true);
		uploadTask.pause();
		expect(uploadTask.state).toEqual(AWSS3UploadTaskState.PAUSED);
		const cancelled = await uploadTask._cancel();
		expect(uploadTask.state).toEqual(AWSS3UploadTaskState.CANCELLED);
		expect(cancelled).toBe(true);
		uploadTask._cancel().then((cancelled) => {
			expect(uploadTask.state).toEqual(AWSS3UploadTaskState.CANCELLED);
			expect(cancelled).toBe(true);
		});
	});

	test('should send listParts request if the upload task is cached', async () => {
		jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(async (command) => {
				if (command instanceof ListPartsCommand) {
					return Promise.resolve({
						Parts: [
							{
								PartNumber: 1,
								Size: 5 * 1024 * 1024,
								ETag: 'etag-1',
							},
							{
								PartNumber: 2,
								Size: 5 * 1024 * 1024,
								ETag: 'etag-2',
							},
						],
					});
				} else if (command instanceof CreateMultipartUploadCommand) {
					return Promise.resolve({
						UploadId: 'uploadId',
					});
				} else if (command instanceof ListObjectsV2Command) {
					return Promise.resolve({
						Contents: [{ Key: input.params.Key, Size: 25048576 }],
					});
				}
			});
		const file = new File(['TestFileContent'], 'testFileName');
		Object.defineProperty(file, 'size', { value: 25048576 });
		const emitter = new events.EventEmitter();
		const input: AWSS3UploadTaskParams = {
			file,
			s3Client: new S3Client(testOpts),
			emitter: emitter,
			storage: mockLocalStorage,
			level: 'public' as StorageAccessLevel,
			params: {
				Bucket: 'bucket',
				Key: 'key',
			},
			prefixPromise: Promise.resolve('prefix'),
		};
		const fileMetadata: FileMetadata = {
			bucket: 'bucket',
			key: 'key',
			lastTouched: Date.now(),
			uploadId: 'uploadId',
			fileName: file.name,
		};
		const fileId = [
			file.name,
			file.lastModified,
			file.size,
			file.type,
			input.params.Bucket,
			input.level,
			input.params.Key,
		].join('-');
		const cachedUploadTasks = {
			[fileId]: fileMetadata,
		};
		mockLocalStorage.setItem(
			UPLOADS_STORAGE_KEY,
			JSON.stringify(cachedUploadTasks)
		);
		const uploadTask = new AWSS3UploadTask(input);
		// kick off the upload task
		uploadTask.resume();
		await uploadTask._cancel();
		expect(mockLocalStorage.getItem).toHaveBeenCalledWith(UPLOADS_STORAGE_KEY);
		expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
			UPLOADS_STORAGE_KEY,
			'{}'
		);
	});
});
