import {
	AWSS3UploadTask,
	AWSS3UploadTaskState,
	AWSS3UploadTaskParams,
	TaskEvents,
} from '../../src/providers/AWSS3UploadTask';
import * as events from 'events';
import {
	abortMultipartUpload,
	completeMultipartUpload,
	listParts,
	createMultipartUpload,
	listObjectsV2,
	uploadPart,
} from '../../src/AwsClients/S3';
import { StorageAccessLevel, FileMetadata } from '../../src/types';
import { UPLOADS_STORAGE_KEY } from '../../src/common/StorageConstants';

jest.mock('../../src/AwsClients/S3');

const MB = 1024 * 1024;

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

// const testOpts: any = {
// 	bucket: 'testBucket',
// 	region: 'testRegion',
// 	credentials,
// 	level: 'level',
// };

let mockLocalStorageItems = {};

const mockLocalStorage = {
	getItem: jest.fn().mockImplementation(key => mockLocalStorageItems[key]),
	setItem: jest.fn().mockImplementation((key, value) => {
		mockLocalStorageItems[key] = value;
	}),
	clear: jest.fn().mockImplementation(() => {
		mockLocalStorageItems = {};
	}),
	removeItem: jest.fn().mockImplementation(key => {
		mockLocalStorageItems[key] = undefined;
	}),
} as unknown as Storage;

const mockCredentialsProvider = jest.fn().mockResolvedValue(credentials);

const defaultS3Config = {
	region: 'us-foo-1',
	credentials: mockCredentialsProvider,
};

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
			s3Config: defaultS3Config,
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
			s3Config: defaultS3Config,
			emitter: emitter,
			storage: mockLocalStorage,
			level: 'public' as StorageAccessLevel,
			params: {
				Bucket: 'bucket',
				Key: 'key',
			},
			prefixPromise: Promise.resolve('prefix'),
		};
		(abortMultipartUpload as jest.Mock).mockResolvedValue({
			Key: input.params.Key,
		});
		(listObjectsV2 as jest.Mock).mockResolvedValue({
			Contents: [{ Key: input.params.Key, Size: 25048576 }],
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
		uploadTask._cancel().then(cancelled => {
			expect(uploadTask.state).toEqual(AWSS3UploadTaskState.CANCELLED);
			expect(cancelled).toBe(false);
		});
	});

	test('should throw error when remote and local file sizes do not match upon completed upload', done => {
		const file = new File(['TestFileContent'], 'testFileName');
		Object.defineProperty(file, 'size', { value: 25048576 });
		const emitter = new events.EventEmitter();
		const input: AWSS3UploadTaskParams = {
			file,
			s3Config: defaultS3Config,
			emitter: emitter,
			storage: mockLocalStorage,
			level: 'public' as StorageAccessLevel,
			params: {
				Bucket: 'bucket',
				Key: 'key',
			},
			prefixPromise: Promise.resolve('prefix'),
		};
		(abortMultipartUpload as jest.Mock).mockResolvedValue({
			Key: input.params.Key,
		});
		(listObjectsV2 as jest.Mock).mockResolvedValue({
			Contents: [{ Key: input.params.Key, Size: 15048576 }],
		});
		(completeMultipartUpload as jest.Mock).mockResolvedValue({});
		(createMultipartUpload as jest.Mock).mockResolvedValue({
			UploadId: 'test-upload-id',
		});
		(uploadPart as jest.Mock).mockResolvedValue({
			ETag: 'test-upload-ETag',
		});
		const uploadTask = new AWSS3UploadTask(input);

		Object.defineProperty(uploadTask, 'params', {
			value: {
				Bucket: 'test-bucket',
				Key: 'test-key',
			},
		});
		Object.defineProperty(uploadTask, 'uploadId', { value: 'test-upload-id' });
		Object.defineProperty(uploadTask, 'completedParts', { value: [] });

		function callback(err) {
			expect(err?.message).toBe(
				'File size does not match between local file and file on s3'
			);
			done();
		}
		emitter.addListener(TaskEvents.ERROR, callback);

		// Only testing
		// @ts-ignore
		uploadTask._completeUpload();
	});

	test('should send listParts request if the upload task is cached', async () => {
		const file = new File(['TestFileContent'], 'testFileName');
		Object.defineProperty(file, 'size', { value: 25048576 });
		const emitter = new events.EventEmitter();
		const input: AWSS3UploadTaskParams = {
			file,
			// s3Client: new S3Client(testOpts),
			s3Config: defaultS3Config,
			emitter: emitter,
			storage: mockLocalStorage,
			level: 'public',
			params: {
				Bucket: 'bucket',
				Key: 'key',
			},
			prefixPromise: Promise.resolve('prefix'),
		};
		(listParts as jest.Mock).mockResolvedValue({
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
		(createMultipartUpload as jest.Mock).mockResolvedValue({
			UploadId: 'uploadId',
		});
		(listObjectsV2 as jest.Mock).mockResolvedValue({
			Contents: [{ Key: 'prefix' + input.params.Key, Size: 25048576 }],
		});
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

	test('upload a body that exceeds the size of default part size and parts count', done => {
		const testUploadId = 'testUploadId';
		let buffer: ArrayBuffer;
		const file = {
			size: 100_000 * MB,
			slice: jest.fn().mockImplementation((start, end) => {
				if (end - start !== buffer?.byteLength) {
					buffer = new ArrayBuffer(end - start);
				}
				return buffer;
			}),
		} as any as File;
		const key = 'key';
		(createMultipartUpload as jest.Mock).mockResolvedValue({
			UploadId: testUploadId,
		});
		(uploadPart as jest.Mock).mockImplementation(async (_, input) => {
			return { ETag: 'test_etag_' + input.PartNumber };
		});
		(completeMultipartUpload as jest.Mock).mockResolvedValue({ Key: key });
		(listObjectsV2 as jest.Mock).mockResolvedValue({
			Contents: [{ Key: 'prefix' + key, Size: file.size }],
		});

		const emitter = new events.EventEmitter();
		const input: AWSS3UploadTaskParams = {
			file,
			s3Config: defaultS3Config,
			emitter,
			storage: mockLocalStorage,
			level: 'public' as StorageAccessLevel,
			params: {
				Bucket: 'bucket',
				Key: 'key',
			},
			prefixPromise: Promise.resolve('prefix'),
		};
		const uploadTask = new AWSS3UploadTask(input);
		uploadTask.resume();
		emitter.on(TaskEvents.UPLOAD_COMPLETE, () => {
			expect(file.slice).toBeCalledTimes(10000); // S3 limit of parts count.
			expect(createMultipartUpload).toBeCalledTimes(1);
			expect(uploadPart).toBeCalledTimes(10000);
			expect(completeMultipartUpload).toBeCalledTimes(1);
			done();
		});
	});

	test('error case: throw if body size exceeds the size limit of S3 object(5TB)', async () => {
		const GB = 1024 * MB;
		const emitter = new events.EventEmitter();
		const input: AWSS3UploadTaskParams = {
			file: { size: 5 * 1024 * GB + 1 } as File,
			s3Config: defaultS3Config,
			emitter: emitter,
			storage: mockLocalStorage,
			level: 'public' as StorageAccessLevel,
			params: {
				Bucket: 'bucket',
				Key: 'key',
			},
			prefixPromise: Promise.resolve('prefix'),
		};
		try {
			new AWSS3UploadTask(input);
			fail('expect test to fail');
		} catch (error) {
			expect(error.message).toEqual(
				expect.stringContaining('File size bigger than S3 Object limit of 5TB')
			);
		}
	});
});
