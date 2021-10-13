import {
	AWSS3UploadTask,
	AWSS3UploadTaskState,
} from '../../src/providers/AWSS3UploadTask';
import * as events from 'events';
import { S3Client, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';

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

describe('resumable upload task test', () => {
	test('constructor test', () => {
		const file = new File(['TestFileContent'], 'testFileName');
		const emitter = new events.EventEmitter();
		const params = {
			accessLevel: 'public',
			file,
			s3Client: new S3Client(testOpts),
			emitter: emitter,
			uploadPartInput: {
				Bucket: 'testBucket',
				Key: 'testKey',
				UploadId: 'uploadId',
			},
		};
		const uploadTask = new AWSS3UploadTask(params);
		expect(uploadTask.isInProgress).toBeFalsy();
	});

	test('pause, resume, cancel should set the task state accordingly', () => {
		const file = new File(['TestFileContent'], 'testFileName');
		Object.defineProperty(file, 'size', { value: 25048576 });
		const emitter = new events.EventEmitter();
		const params = {
			accessLevel: 'public',
			file,
			s3Client: new S3Client(testOpts),
			emitter: emitter,
			uploadPartInput: {
				Bucket: 'testBucket',
				Key: 'testKey',
				UploadId: 'uploadId',
			},
		};
		jest.spyOn(S3Client.prototype, 'send').mockImplementation(async command => {
			if (command instanceof AbortMultipartUploadCommand) {
				return Promise.resolve({ Key: params.uploadPartInput.Key });
			}
		});
		const uploadTask = new AWSS3UploadTask(params);
		expect(uploadTask.state).toEqual(AWSS3UploadTaskState.INIT);
		uploadTask.resume();
		expect(uploadTask.state).toEqual(AWSS3UploadTaskState.IN_PROGRESS);
		expect(uploadTask.isInProgress).toBeTruthy();
		uploadTask.pause();
		expect(uploadTask.state).toEqual(AWSS3UploadTaskState.PAUSED);
		uploadTask.cancel();
		expect(uploadTask.state).toEqual(AWSS3UploadTaskState.CANCELLED);
	});
});
