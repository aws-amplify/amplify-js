import {
	AWSS3UploadManager,
	AddTaskInput,
} from '../../src/providers/AWSS3UploadManager';
import { AWSS3UploadTask } from '../../src/providers/AWSS3UploadTask';
import * as events from 'events';
import {
	S3Client,
	ListPartsCommand,
	CreateMultipartUploadCommand,
	AbortMultipartUploadCommand,
	UploadPartCommand,
	CompleteMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { StorageHelper, Credentials, Hub } from '@aws-amplify/core';
import * as sinon from 'sinon';

const testUploadId = 'testUploadId';
const testParams: any = {
	Bucket: 'testBucket',
	Key: 'testKey',
};
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
const localStorageMock = (function() {
	let store: Record<string, any> = {};
	return {
		getItem: function(key: string) {
			return store[key];
		},
		setItem: function(key: string, value: any) {
			store[key] = value.toString();
		},
		clear: function() {
			store = {};
		},
		removeItem: function(key: string) {
			delete store[key];
		},
		getAllItems: function() {
			return store;
		},
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
	writable: true,
});

jest.spyOn(Credentials, 'get').mockImplementation(() => {
	return Promise.resolve(credentials);
});

afterEach(() => {
	jest.clearAllMocks();
});

describe('resumable upload test', () => {
	const s3ServiceCallSpy = jest
		.spyOn(S3Client.prototype, 'send')
		.mockImplementation(async command => {
			if (command instanceof CreateMultipartUploadCommand) {
				return Promise.resolve({ UploadId: testUploadId });
			} else if (command instanceof UploadPartCommand) {
				return Promise.resolve({
					ETag: 'test_etag_' + command.input.PartNumber,
				});
			} else if (command instanceof CompleteMultipartUploadCommand) {
				return Promise.resolve({ Key: testParams.Key });
			} else if (command instanceof ListPartsCommand) {
				return Promise.resolve({});
			} else if (command instanceof AbortMultipartUploadCommand) {
				return Promise.resolve({ Key: testParams.Key });
			}
		});

	test('should listen to auth signin and signout events', async () => {
		const hubSpy = jest.spyOn(Hub, 'listen');
		const storageHelper = new StorageHelper();
		new AWSS3UploadManager();
		expect(hubSpy).toHaveBeenCalledTimes(1);
		expect(hubSpy).toHaveBeenCalledWith('auth', expect.any(Function));
		const mockLocalStorage = storageHelper.getStorage();
		const mockRemoveItemFn = jest.fn();
		mockLocalStorage['removeItem'] = mockRemoveItemFn;
		Hub.dispatch('auth', {
			event: 'signIn',
		});
		Hub.dispatch('auth', {
			event: 'signOut',
		});
		expect(mockRemoveItemFn).toHaveBeenCalledTimes(2);
	});

	test('happy case: upload a file as body, pause, and resume', async () => {
		const emitter = new events.EventEmitter();
		const eventSpy = sinon.spy();
		emitter.on('sendUploadProgress', eventSpy);

		const file = new File(['TestFileContent'], 'testFileName');
		Object.defineProperty(file, 'size', { value: 25048576 });

		const taskInput: AddTaskInput = {
			accessLevel: 'public',
			file,
			bucket: 'testBucket',
			key: 'testKey',
			s3Client: new S3Client(testOpts),
			emitter: emitter,
		};

		const onCompleteSpy = jest.fn();
		const onProgressSpy = jest.fn();
		const storageHelper = new StorageHelper();
		expect(storageHelper.getStorage()).toBe(localStorageMock);

		const uploadTaskManager = new AWSS3UploadManager();
		const uploadTask = await uploadTaskManager.addTask(taskInput);

		uploadTask.onComplete(onCompleteSpy);
		uploadTask.onProgress(onProgressSpy);

		expect((<any>uploadTask).state).toEqual(1);
		expect((<any>uploadTask).inProgress).toHaveLength(4);

		uploadTask.pause();
		expect((<any>uploadTask).state).toEqual(2);
		expect((<any>uploadTask).inProgress).toEqual([]);

		uploadTask.resume();
		expect((<any>uploadTask).state).toEqual(1);
		expect((<any>uploadTask).inProgress).toHaveLength(4);
	});

	test('resuming an existing upload and not create a new file key in __uploadInProgress', async () => {
		const emitter = new events.EventEmitter();
		const storageHelper = new StorageHelper();
		expect(storageHelper.getStorage()).toBe(localStorageMock);

		const file = new File(['TestFileContent'], 'testFileName');
		Object.defineProperty(file, 'size', { value: 25048576 });

		const taskInput: AddTaskInput = {
			accessLevel: 'public',
			file,
			bucket: 'testBucket',
			key: 'testKey',
			s3Client: new S3Client(testOpts),
			emitter: emitter,
		};

		const uploadTaskManager = new AWSS3UploadManager();
		const uploadTask = await uploadTaskManager.addTask(taskInput);
		uploadTask.pause();

		await uploadTaskManager.addTask(taskInput);

		const uploadsInProgress = JSON.parse(
			storageHelper.getStorage().getItem('__uploadInProgress')
		);

		expect(uploadsInProgress).toBeDefined();
		expect(Object.keys(uploadsInProgress).length).toBe(1);
	});

	test('aborting a resumable upload removes the file key from __uploadInProgress', async () => {
		const emitter = new events.EventEmitter();
		const storageHelper = new StorageHelper();
		expect(storageHelper.getStorage()).toBe(localStorageMock);

		const file = new File(['TestFileContent'], 'testFileName');
		Object.defineProperty(file, 'size', { value: 25048576 });

		const taskInput: AddTaskInput = {
			accessLevel: 'public',
			file,
			bucket: 'testBucket',
			key: 'testKey',
			s3Client: new S3Client(testOpts),
			emitter: emitter,
		};

		const uploadTaskManager = new AWSS3UploadManager();
		const uploadTask = await uploadTaskManager.addTask(taskInput);
		let uploadsInProgress = JSON.parse(
			storageHelper.getStorage().getItem('__uploadInProgress')
		);

		uploadTask.pause();

		expect(uploadsInProgress).toBeDefined();
		expect(Object.keys(uploadsInProgress).length).toBe(1);

		uploadTask.cancel();
		uploadsInProgress = JSON.parse(
			storageHelper.getStorage().getItem('__uploadInProgress')
		);

		expect(Object.keys(uploadsInProgress).length).toBe(0);
		expect(() => uploadTask.resume()).toThrowError();
	});

	test('resumable should be able to handle blobs', async () => {
		const emitter = new events.EventEmitter();
		const storageHelper = new StorageHelper();
		expect(storageHelper.getStorage()).toBe(localStorageMock);

		const file = new Blob(['TestBlob', 'testFileName']);
		Object.defineProperty(file, 'size', { value: 25048576 });

		const taskInput: AddTaskInput = {
			accessLevel: 'public',
			file,
			bucket: 'testBucket',
			key: 'testKey',
			s3Client: new S3Client(testOpts),
			emitter: emitter,
		};

		const uploadTaskManager = new AWSS3UploadManager();
		const uploadTask = await uploadTaskManager.addTask(taskInput);

		expect(uploadTask).toBeInstanceOf(AWSS3UploadTask);
	});

	test('stale uploads should be purged after 1 hour by default', async () => {
		const emitter = new events.EventEmitter();
		const file = new File(['TestFileContent'], 'testFileName');
		Object.defineProperty(file, 'size', { value: 25048576 });

		const taskInput: AddTaskInput = {
			accessLevel: 'public',
			file,
			bucket: 'testBucket',
			key: 'testKey',
			s3Client: new S3Client(testOpts),
			emitter: emitter,
		};

		const uploadTaskManager = new AWSS3UploadManager();
		const currentTimeStamp = Date.now();
		const oneHour = 1000 * 60 * 60 + 10;
		const uploadTask = await uploadTaskManager.addTask(taskInput);

		uploadTask.pause();

		//mocking Date.now() to return a timestamp one hour into the future
		const dateNowSpy = jest
			.spyOn(Date, 'now')
			.mockImplementation(() => currentTimeStamp + oneHour);

		const duplicateUploadTask = await uploadTaskManager.addTask(taskInput);

		expect(dateNowSpy).toHaveBeenCalled();
		expect(duplicateUploadTask).toBeInstanceOf(AWSS3UploadTask);
		expect(s3ServiceCallSpy.mock.calls[5][0].input).toEqual({
			Bucket: testParams.Bucket,
			Key: testParams.Key,
			UploadId: testUploadId,
		});
	});
});
