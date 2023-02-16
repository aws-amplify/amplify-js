// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AWSS3ProviderManagedUpload } from '../../src/providers/AWSS3ProviderManagedUpload';
import {
	S3Client,
	PutObjectCommand,
	UploadPartCommand,
	CompleteMultipartUploadCommand,
	CreateMultipartUploadCommand,
	AbortMultipartUploadCommand,
	ListPartsCommand,
} from '@aws-sdk/client-s3';
import { Logger } from '@aws-amplify/core';
import * as events from 'events';
import { SEND_UPLOAD_PROGRESS_EVENT } from '../../src/providers/axios-http-handler';

const MB = 1024 * 1024;
const defaultPartSize = 5 * MB;

jest.useRealTimers();

const testUploadId = 'testUploadId';

const baseParams: any = {
	Bucket: 'testBucket',
	Key: 'testKey',
	ContentType: 'testContentType',
	SSECustomerAlgorithm: 'AES256',
	SSECustomerKey: '1234567890',
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

describe(AWSS3ProviderManagedUpload.name, () => {
	const mockBodySlice = jest
		.fn()
		.mockImplementation((start, end) => Buffer.alloc(end - start));
	const mockBody = (length: number) => ({
		length,
		slice: mockBodySlice,
	});

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

			const testParams = { ...baseParams, Body: 'A_STRING_BODY' };
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
			const testParamsWithObjectBody = { ...baseParams, Body: objectBody };
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
			const testParamsWithFileBody = { ...baseParams, Body: file };
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

		test('error case: upload fails', async () => {
			const s3ServiceCallSpy = jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementation(command => {
					if (command instanceof PutObjectCommand) {
						return Promise.reject('PutObject Mock Error');
					} else {
						fail('Only PutObject API call can be made for single part upload');
					}
				});

			const uploader = new AWSS3ProviderManagedUpload(
				{ ...baseParams, Body: 'Mock_body' },
				testOpts,
				new events.EventEmitter()
			);
			expect.assertions(1);
			try {
				await uploader.upload();
				fail('Expect test to fail');
			} catch (e) {
				expect(e).toBe('PutObject Mock Error');
			}
		});
	});

	describe('multi part upload tests', () => {
		test('happy case: upload a body that splits in two parts', async () => {
			// Setup Spy for S3 service calls
			const s3ServiceCallSpy = jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementation(async (command, axiosOptions) => {
					if (command instanceof CreateMultipartUploadCommand) {
						return Promise.resolve({ UploadId: testUploadId });
					} else if (command instanceof UploadPartCommand) {
						(axiosOptions as any).emitter.emit(SEND_UPLOAD_PROGRESS_EVENT, {
							loaded: (command?.input?.Body as Buffer)?.length,
						});
						return Promise.resolve({
							ETag: 'test_etag_' + command.input.PartNumber,
						});
					} else if (command instanceof CompleteMultipartUploadCommand) {
						return Promise.resolve({ Key: baseParams.Key });
					}
				});

			const emitter = new events.EventEmitter();
			const eventSpy = jest.fn();
			emitter.on('sendUploadProgress', eventSpy);

			const body = mockBody(defaultPartSize + 1);
			const testParams = { ...baseParams, Body: body };
			const uploader = new AWSS3ProviderManagedUpload(
				testParams,
				testOpts,
				emitter
			);
			const data = await uploader.upload();

			// Testing multi part upload functionality
			expect(data).toBe(testParams.Key);
			expect(s3ServiceCallSpy).toBeCalledTimes(4);
			expect(mockBodySlice).toBeCalledTimes(2);

			// Create multipart upload call
			expect(s3ServiceCallSpy.mock.calls[0][0].input).toStrictEqual(testParams);

			// Next two upload parts call
			expect(s3ServiceCallSpy.mock.calls[1][0].input).toMatchObject({
				Bucket: testParams.Bucket,
				Key: testParams.Key,
				PartNumber: 1,
				UploadId: testUploadId,
				SSECustomerAlgorithm: testParams.SSECustomerAlgorithm,
				SSECustomerKey: testParams.SSECustomerKey,
			});
			expect(mockBodySlice).toHaveBeenNthCalledWith(1, 0, defaultPartSize);
			expect(s3ServiceCallSpy.mock.calls[2][0].input).toMatchObject({
				Bucket: testParams.Bucket,
				Key: testParams.Key,
				PartNumber: 2,
				UploadId: testUploadId,
				SSECustomerAlgorithm: testParams.SSECustomerAlgorithm,
				SSECustomerKey: testParams.SSECustomerKey,
			});
			expect(mockBodySlice).toHaveBeenNthCalledWith(
				2,
				defaultPartSize,
				defaultPartSize + 1
			);

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
			expect(eventSpy).toHaveBeenNthCalledWith(1, {
				key: testParams.Key,
				loaded: defaultPartSize,
				part: 1,
				total: testParams.Body.length,
			});
			// Second progress is reported at the end of second and final part
			expect(eventSpy).toHaveBeenNthCalledWith(2, {
				key: testParams.Key,
				loaded: body.length,
				part: 2,
				total: testParams.Body.length,
			});
		});

		test('happy case: upload a body that exceeds the size of default part size and parts count', async () => {
			// Setup Spy for S3 service calls
			const s3ServiceCallSpy = jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementation(async (command, axiosOptions) => {
					if (command instanceof CreateMultipartUploadCommand) {
						return Promise.resolve({ UploadId: testUploadId });
					} else if (command instanceof UploadPartCommand) {
						(axiosOptions as any).emitter.emit(SEND_UPLOAD_PROGRESS_EVENT, {
							loaded: (command?.input?.Body as Buffer)?.length,
						});
						return Promise.resolve({
							ETag: 'test_etag_' + command.input.PartNumber,
						});
					} else if (command instanceof CompleteMultipartUploadCommand) {
						return Promise.resolve({ Key: baseParams.Key });
					}
				});

			// setup params. Body size should cause the part size to double;
			const body = mockBody(20_000 * defaultPartSize);
			const testParams = { ...baseParams, Body: body };
			const uploader = new AWSS3ProviderManagedUpload(
				testParams,
				testOpts,
				new events.EventEmitter()
			);
			const data = await uploader.upload();

			// Testing multi part upload functionality
			expect(data).toBe(testParams.Key);
			expect(mockBodySlice).toBeCalledTimes(10000); // S3 limit of parts count.
			expect(s3ServiceCallSpy).toBeCalledTimes(10000 + 2);
		});

		test('error case: throw if body size exceeds the size limit of S3 object(5TB)', async () => {
			const GB = 1024 * MB;
			const body = mockBody(5 * 1024 * GB + 1); // exceeds 5TB limit.
			const testParams = { ...baseParams, Body: body };
			const uploader = new AWSS3ProviderManagedUpload(
				testParams,
				testOpts,
				new events.EventEmitter()
			);
			expect.assertions(1);
			try {
				const data = await uploader.upload();
				fail('expect test to fail');
			} catch (error) {
				expect(error.message).toEqual(
					expect.stringContaining(
						'File size bigger than S3 Object limit of 5TB'
					)
				);
			}
		});

		test('error case: upload a body that splits in two parts but second part fails', async () => {
			// Setup Spy for S3 service calls and introduce a service failure
			const s3ServiceCallSpy = jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementation(async (command, axiosOptions) => {
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
									(axiosOptions as any).emitter.emit(
										SEND_UPLOAD_PROGRESS_EVENT,
										{
											loaded: (command?.input?.Body as Buffer)?.length,
										}
									);
								}, 200);
							});
						}
						return promise;
					} else if (command instanceof CompleteMultipartUploadCommand) {
						return Promise.resolve({ Key: baseParams.key });
					}
				});

			const emitter = new events.EventEmitter();
			const eventSpy = jest.fn();
			emitter.on('sendUploadProgress', eventSpy);
			const body = mockBody(defaultPartSize + 1);
			const testParams = { ...baseParams, Body: body };
			const uploader = new AWSS3ProviderManagedUpload(
				testParams,
				testOpts,
				emitter
			);
			// Upload should have been cancelled and error thrown
			try {
				await uploader.upload();
			} catch (error) {
				expect(error.message).toBe('Part 2 just going to fail in 100ms');
			}

			// Should have called 5 times =>
			// CreateMultiPartUpload + 2 x UploadParts + AbortMultiPart + ListParts
			expect(s3ServiceCallSpy).toBeCalledTimes(5);

			// Create multipart upload call
			expect(s3ServiceCallSpy.mock.calls[0][0].input).toStrictEqual(testParams);

			// First call succeeds
			expect(s3ServiceCallSpy.mock.calls[1][0].input).toMatchObject({
				Bucket: testParams.Bucket,
				Key: testParams.Key,
				PartNumber: 1,
				UploadId: testUploadId,
				SSECustomerAlgorithm: testParams.SSECustomerAlgorithm,
				SSECustomerKey: testParams.SSECustomerKey,
			});
			expect(mockBodySlice).toHaveBeenNthCalledWith(1, 0, defaultPartSize);

			// Second call fails
			expect(s3ServiceCallSpy.mock.calls[2][0].input).toMatchObject({
				Bucket: testParams.Bucket,
				Key: testParams.Key,
				PartNumber: 2,
				UploadId: testUploadId,
				SSECustomerAlgorithm: testParams.SSECustomerAlgorithm,
				SSECustomerKey: testParams.SSECustomerKey,
			});
			expect(mockBodySlice).toHaveBeenNthCalledWith(
				2,
				defaultPartSize,
				defaultPartSize + 1
			);

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

			// As the 'sendUploadProgress' happens when the upload is 100% complete,
			// it won't be called, as an error is thrown before upload completion.
			expect(eventSpy).toBeCalledTimes(0);
		});

		test('error case: cleanup failed', async () => {
			jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementation(async command => {
					if (command instanceof CreateMultipartUploadCommand) {
						return Promise.resolve({ UploadId: testUploadId });
					} else if (command instanceof UploadPartCommand) {
						return Promise.resolve({});
					} else if (command instanceof ListPartsCommand) {
						return Promise.resolve({
							Parts: [
								{
									PartNumber: 1,
								},
							],
						});
					} else if (command instanceof AbortMultipartUploadCommand) {
						return Promise.resolve();
					}
				});
			const body = mockBody(defaultPartSize + 1);
			const testParams = { ...baseParams, Body: body };
			const uploader = new AWSS3ProviderManagedUpload(
				testParams,
				testOpts,
				new events.EventEmitter()
			);

			await expect(uploader.upload()).rejects.toThrow(
				'Multipart upload clean up failed.'
			);
		});

		test('error case: finish multipart upload failed', async () => {
			jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementation(async command => {
					if (command instanceof CreateMultipartUploadCommand) {
						return Promise.resolve({ UploadId: testUploadId });
					} else if (command instanceof UploadPartCommand) {
						return Promise.resolve({
							ETag: 'test_etag_' + command.input.PartNumber,
						});
					} else if (command instanceof CompleteMultipartUploadCommand) {
						return Promise.reject(
							new Error('Error completing multipart upload.')
						);
					}
				});
			const loggerSpy = jest.spyOn(Logger.prototype, '_log');
			const body = mockBody(defaultPartSize + 1);
			const testParams = { ...baseParams, Body: body };
			const uploader = new AWSS3ProviderManagedUpload(
				testParams,
				testOpts,
				new events.EventEmitter()
			);

			await expect(uploader.upload()).rejects.toThrow(
				'Error completing multipart upload.'
			);
			expect(loggerSpy).toHaveBeenNthCalledWith(1, 'DEBUG', 'testUploadId');
			expect(loggerSpy).toHaveBeenNthCalledWith(
				2,
				'ERROR',
				'Error happened while finishing the upload.'
			);
			expect(loggerSpy).toHaveBeenNthCalledWith(
				3,
				'ERROR',
				'Error. Cancelling the multipart upload.'
			);
		});
	});
});
