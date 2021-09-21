import { AWSS3UploadManager, AddTaskInput } from "../../src/providers/AWSS3UploadManager";
import { AWSS3UploadTask } from "../../src/providers/AWSS3UploadTask";
import * as events from 'events';
import {
	S3Client,
	ListPartsCommand,
	CreateMultipartUploadCommand,
	AbortMultipartUploadCommand,
	UploadPartCommand,
	CompleteMultipartUploadCommand
} from '@aws-sdk/client-s3';
import { StorageHelper, Credentials  } from '@aws-amplify/core';
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
	let store = {};
	return {
		getItem: function(key) {
			return store[key];
		},
		setItem: function(key, value) {
			store[key] = value.toString();
		},
		clear: function() {
			store = {};
		},
		removeItem: function(key) {
			delete store[key];
		},
		getAllItems: function() {
			return store;
		}
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
	writable: true,
});

jest.useFakeTimers();

function waitOneSecond() {
	setTimeout(() => {
		return;
	}, 1000)
}

function waitTenSeconds() {
	setTimeout(() => {
		return;
	}, 10000)
}

describe('resumable upload test', () => {
	const s3ServiceCallSpy = jest.spyOn(S3Client.prototype, 'send').mockImplementation(async command => {
		if (command instanceof CreateMultipartUploadCommand) {
			return Promise.resolve({ UploadId: testUploadId });
		} else if (command instanceof UploadPartCommand) {
			return Promise.resolve({
				ETag: 'test_etag_' + command.input.PartNumber,
			});
		} else if (command instanceof CompleteMultipartUploadCommand) {
			return Promise.resolve({ Key: testParams.Key });
		} else if (command instanceof ListPartsCommand) {
			return Promise.resolve({
				
			})
		} else if (command instanceof AbortMultipartUploadCommand) {
			return Promise.resolve({ Key: testParams.Key });
		}
	});

	test('happy case: upload a file as body, pause, and resume', async() => {
		jest.spyOn(Credentials, 'get').mockImplementation(() => {
			return Promise.resolve(credentials);
		});

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
		expect(storageHelper.getStorage()).toBe(localStorageMock)
		
		const uploadTaskManager = new AWSS3UploadManager();
		const uploadTask = await uploadTaskManager.addTask(taskInput);

		uploadTask.onComplete(onCompleteSpy);
		uploadTask.onProgress(onProgressSpy);

		expect(uploadTask.inProgress).toHaveLength(4);

		uploadTask.pause();
		expect(uploadTask.inProgress).toEqual([]);

		uploadTask.resume();
		expect(uploadTask.inProgress).toHaveLength(4);
	});

	test('resuming an existing upload and not create a new file key in __uploadInProgress', async() => { 
		jest.spyOn(Credentials, 'get').mockImplementation(() => {
			return Promise.resolve(credentials);
		});

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
		
		const uploadsInProgress = JSON.parse(storageHelper.getStorage().getItem('__uploadInProgress'));

		expect(uploadsInProgress).toBeDefined();
		expect(Object.keys(uploadsInProgress).length).toBe(1);

	});

	test('aborting a resumable upload removes the file key from __uploadInProgress', async() => { 
		jest.spyOn(Credentials, 'get').mockImplementation(() => {
			return Promise.resolve(credentials);
		});
	
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
		let uploadsInProgress = JSON.parse(storageHelper.getStorage().getItem('__uploadInProgress'));
	
		uploadTask.pause();
		
		expect(uploadsInProgress).toBeDefined();
		expect(Object.keys(uploadsInProgress).length).toBe(1);
	
		uploadTask.abort();
		uploadsInProgress = JSON.parse(storageHelper.getStorage().getItem('__uploadInProgress'));
	
		expect(Object.keys(uploadsInProgress).length).toBe(0);
		expect(() => uploadTask.start()).toThrowError();
	});

	test('resumable should be able to handle blobs', async() => {
		jest.spyOn(Credentials, 'get').mockImplementation(() => {
			return Promise.resolve(credentials);
		});
	
		const emitter = new events.EventEmitter();
		const storageHelper = new StorageHelper();
		expect(storageHelper.getStorage()).toBe(localStorageMock);

		const file = new Blob(['TestBlob', 'testFileName']);
		Object.defineProperty(file, 'size', { value: 25048576 }
		
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

})