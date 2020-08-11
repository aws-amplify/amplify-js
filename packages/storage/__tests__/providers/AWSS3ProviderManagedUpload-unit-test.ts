/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import {
	AWSS3ProviderManagedUpload,
	BodyPart,
} from '../../src/providers/AWSS3ProviderManagedUpload';
import { Credentials } from '@aws-amplify/core';
import {
	S3Client,
	PutObjectCommand,
	UploadPartCommand,
	ListPartsCommand,
	AbortMultipartUploadCommand,
	CompleteMultipartUploadCommand,
	CreateMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import * as events from 'events';
import * as sinon from 'sinon';

jest.useRealTimers();

const testUploadId = 'testUploadId';

const testParams: any = {
	Bucket: 'testBucket',
	Key: 'testKey',
	Body: 'testDataBody',
	ContentType: 'testContentType',
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

const testMinPartSize = 10; // Merely 10 Bytes

afterEach(() => {
	jest.restoreAllMocks();
	jest.clearAllMocks();
});

describe('single part upload tests', () => {
	test('upload a string as body', async () => {
		const putObjectSpyOn = jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(command => {
				if (command instanceof PutObjectCommand)
					return Promise.resolve(command.input.Key);
			});
		const uploader = new AWSS3ProviderManagedUpload(
			testParams,
			testOpts,
			new events.EventEmitter()
		);
		const data = await uploader.upload();
		expect(data).toBe(testParams.Key);
		expect(putObjectSpyOn.mock.calls[0][0].input).toStrictEqual(testParams);
	});

	test('upload a javascript object as body', async () => {
		const putObjectSpyOn = jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(command => {
				if (command instanceof PutObjectCommand)
					return Promise.resolve(command.input.Key);
			});
		const objectBody = { key1: 'value1', key2: 'value2' };
		const testParamsWithObjectBody: any = Object.assign({}, testParams);
		testParamsWithObjectBody.Body = objectBody;
		const uploader = new AWSS3ProviderManagedUpload(
			testParamsWithObjectBody,
			testOpts,
			new events.EventEmitter()
		);
		const data = await uploader.upload();
		expect(data).toBe(testParamsWithObjectBody.Key);
		expect(putObjectSpyOn.mock.calls[0][0].input).toStrictEqual(
			testParamsWithObjectBody
		);
	});

	test('upload a file as body', async () => {
		const putObjectSpyOn = jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(command => {
				if (command instanceof PutObjectCommand)
					return Promise.resolve(command.input.Key);
			});
		const file = new File(['TestFileContent'], 'testFileName');
		const testParamsWithFileBody: any = Object.assign({}, testParams);
		testParamsWithFileBody.Body = file;
		const uploader = new AWSS3ProviderManagedUpload(
			testParamsWithFileBody,
			testOpts,
			new events.EventEmitter()
		);
		const data = await uploader.upload();
		expect(data).toBe(testParamsWithFileBody.Key);
		expect(putObjectSpyOn.mock.calls[0][0].input).toStrictEqual(
			testParamsWithFileBody
		);
	});
});

describe('multi part upload tests', () => {
	test('happy case: upload a string as body that splits in two parts', async () => {
		// setup event handling
		const emitter = new events.EventEmitter();
		const eventSpy = sinon.spy();
		emitter.on('sendProgress', eventSpy);

		/** Extend our test class such that minPartSize is reasonable
		 * and we can mock emit the progress events
		 */
		class TestClass extends AWSS3ProviderManagedUpload {
			protected minPartSize = testMinPartSize;
			protected async uploadParts(uploadId: string, parts: BodyPart[]) {
				// Make service calls and set the event listeners first from the base impl
				await super.uploadParts(uploadId, parts);
				// Now trigger some notifications from the event listeners
				for (const part of parts) {
					part.emitter.emit('sendProgress', {
						// Assume that the notification is sent when 100% of part is uploaded
						loaded: part.bodyPart.length,
					});
				}
			}
		}

		// Setup Spy for S3 service calls
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
				}
			});

		// Now make calls
		const uploader = new TestClass(testParams, testOpts, emitter);
		const data = await uploader.upload();

		// Testing multi part upload functionality
		expect(data).toBe(testParams.Key);
		expect(s3ServiceCallSpy).toBeCalledTimes(4);

		// Create multipart upload call
		expect(s3ServiceCallSpy.mock.calls[0][0].input).toStrictEqual(testParams);

		// Next two upload parts call
		expect(s3ServiceCallSpy.mock.calls[1][0].input).toStrictEqual({
			Body: testParams.Body.slice(0, testMinPartSize),
			Bucket: testParams.Bucket,
			Key: testParams.Key,
			PartNumber: 1,
			UploadId: testUploadId,
		});
		expect(s3ServiceCallSpy.mock.calls[2][0].input).toStrictEqual({
			Body: testParams.Body.slice(testMinPartSize, testParams.Body.length),
			Bucket: testParams.Bucket,
			Key: testParams.Key,
			PartNumber: 2,
			UploadId: testUploadId,
		});

		// Lastly complete multi part upload call
		expect(s3ServiceCallSpy.mock.calls[3][0].input).toStrictEqual({
			Bucket: testParams.Bucket,
			Key: testParams.Key,
			MultipartUpload: {
				Parts: [
					{
						ETag: 'test_etag_1',
						PartNumber: 1,
					},
					{
						ETag: 'test_etag_2',
						PartNumber: 2,
					},
				],
			},
			UploadId: testUploadId,
		});

		// Progress report testing
		// First progress is reported at the end, when first full part is uploaded
		expect(eventSpy.getCall(0).args[0]).toStrictEqual({
			key: testParams.Key,
			loaded: testMinPartSize,
			part: 1,
			total: testParams.Body.length,
		});
		// Second progress is reported at the end of second and final part
		expect(eventSpy.getCall(1).args[0]).toStrictEqual({
			key: testParams.Key,
			loaded: testParams.Body.length,
			part: 2,
			total: testParams.Body.length,
		});
	});

	test('error case: upload a string as body that splits in two parts but second part fails', async () => {
		// setup event handling
		const emitter = new events.EventEmitter();
		const eventSpy = sinon.spy();
		emitter.on('sendProgress', eventSpy);

		/** Extend our test class such that minPartSize is reasonable
		 * and we can mock emit the progress events
		 */
		class TestClass extends AWSS3ProviderManagedUpload {
			protected minPartSize = testMinPartSize;
			protected async uploadParts(uploadId: string, parts: BodyPart[]) {
				// Make service calls and set the event listeners first
				await super.uploadParts(uploadId, parts);
				// Now trigger some notifications from the event listeners
				for (const part of parts) {
					part.emitter.emit('sendProgress', {
						// Assume that the notification is send when 100% of part is uploaded
						loaded: part.bodyPart.length,
					});
				}
			}
		}

		// Setup Spy for S3 service calls and introduce a service failure
		const s3ServiceCallSpy = jest
			.spyOn(S3Client.prototype, 'send')
			.mockImplementation(async command => {
				if (command instanceof CreateMultipartUploadCommand) {
					return Promise.resolve({ UploadId: testUploadId });
				} else if (command instanceof UploadPartCommand) {
					let promise = null;
					if (command.input.PartNumber === 2) {
						promise = new Promise((resolve, reject) => {
							setTimeout(() => {
								reject(new Error('Part 2 just going to fail in 100ms'));
							}, 100);
						});
					} else {
						promise = new Promise((resolve, reject) => {
							setTimeout(() => {
								resolve({
									ETag: 'test_etag_' + command.input.PartNumber,
								});
							}, 200);
						});
					}
					return promise;
				} else if (command instanceof CompleteMultipartUploadCommand) {
					return Promise.resolve({ Key: testParams.key });
				}
			});

		// Now make calls
		const uploader = new TestClass(testParams, testOpts, emitter);
		// Upload should have been cancelled and error thrown
		try {
			await uploader.upload();
		} catch (error) {
			expect(error.message).toBe('Upload was cancelled.');
		}

		// Should have called 5 times =>
		// CreateMultiPartUpload + 2 x UploadParts + AbortMultiPart + ListParts
		expect(s3ServiceCallSpy).toBeCalledTimes(5);

		// Create multipart upload call
		expect(s3ServiceCallSpy.mock.calls[0][0].input).toStrictEqual(testParams);

		// First call succeeds
		expect(s3ServiceCallSpy.mock.calls[1][0].input).toStrictEqual({
			Body: testParams.Body.slice(0, testMinPartSize),
			Bucket: testParams.Bucket,
			Key: testParams.Key,
			PartNumber: 1,
			UploadId: testUploadId,
		});

		// Second call fails
		expect(s3ServiceCallSpy.mock.calls[2][0].input).toStrictEqual({
			Body: testParams.Body.slice(testMinPartSize, testParams.Body.length),
			Bucket: testParams.Bucket,
			Key: testParams.Key,
			PartNumber: 2,
			UploadId: testUploadId,
		});

		// so we abort the multipart upload
		expect(s3ServiceCallSpy.mock.calls[3][0].input).toStrictEqual({
			Bucket: testParams.Bucket,
			Key: testParams.Key,
			UploadId: testUploadId,
		});

		// And finally list parts call to verify
		expect(s3ServiceCallSpy.mock.calls[4][0].input).toStrictEqual({
			Bucket: testParams.Bucket,
			Key: testParams.Key,
			UploadId: testUploadId,
		});

		// Progress reporting works as well
		expect(eventSpy.getCall(0).args[0]).toStrictEqual({
			key: testParams.Key,
			loaded: testMinPartSize,
			part: 1,
			total: testParams.Body.length,
		});
		expect(eventSpy.getCall(1).args[0]).toStrictEqual({
			key: testParams.Key,
			loaded: testParams.Body.length,
			part: 2,
			total: testParams.Body.length,
		});
	});
});
