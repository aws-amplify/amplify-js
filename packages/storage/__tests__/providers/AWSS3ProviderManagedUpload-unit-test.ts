// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Logger } from '@aws-amplify/core';
import * as events from 'events';
import { AWSS3ProviderManagedUpload } from '../../src/providers/AWSS3ProviderManagedUpload';
import {
	putObject,
	uploadPart,
	completeMultipartUpload,
	createMultipartUpload,
	abortMultipartUpload,
	listParts,
} from '../../src/AwsClients/S3';
import { SEND_UPLOAD_PROGRESS_EVENT } from '../../src/AwsClients/S3/utils';
import { credentialsProvider } from '../../src/common/S3ClientUtils';

const MB = 1024 * 1024;
const defaultPartSize = 5 * MB;

jest.useRealTimers();
jest.mock('../../src/AwsClients/S3');
jest.mock('../../src/common/S3ClientUtils', () => ({
	...jest.requireActual('../../src/common/S3ClientUtils'),
	credentialsProvider: jest.fn(), // mock this to avoid calling real credentials
}));

const testUploadId = 'testUploadId';

const baseParams: any = {
	Bucket: 'testBucket',
	Key: 'testKey',
	ContentType: 'testContentType',
	SSECustomerAlgorithm: 'AES256',
	SSECustomerKey: '1234567890',
};

const expectedBaseInputParams = {
	...baseParams,
	Key: `public/${baseParams.Key}`,
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
	beforeEach(() => {
		(credentialsProvider as jest.Mock).mockResolvedValue(credentials);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		jest.resetAllMocks();
	});

	describe('single part upload tests', () => {
		beforeEach(() => {
			(putObject as jest.Mock).mockImplementation(
				async (_, input) => input.Key
			);
		});
		test('upload a string as body', async () => {
			const testParams = { ...baseParams, Body: 'A_STRING_BODY' };
			const expectedTestParams = {
				...expectedBaseInputParams,
				Body: testParams.Body,
			};
			const uploader = new AWSS3ProviderManagedUpload(
				testParams,
				testOpts,
				new events.EventEmitter()
			);
			const data = await uploader.upload();

			expect(data).toBe(expectedBaseInputParams.Key);
			expect(putObject).toBeCalledTimes(1);
			expect(putObject).toBeCalledWith(expect.anything(), expectedTestParams);
		});

		test('upload a javascript object as body', async () => {
			const objectBody = { key1: 'value1', key2: 'value2' };
			const testParamsWithObjectBody = { ...baseParams, Body: objectBody };
			const expectedTestParamsWithObjectBody = {
				...expectedBaseInputParams,
				Body: JSON.stringify(objectBody),
			};
			const uploader = new AWSS3ProviderManagedUpload(
				testParamsWithObjectBody,
				testOpts,
				new events.EventEmitter()
			);
			const data = await uploader.upload();

			expect(data).toBe(expectedBaseInputParams.Key);
			expect(putObject).toBeCalledWith(
				expect.anything(),
				expectedTestParamsWithObjectBody
			);
		});

		test('upload a file as body', async () => {
			const file = new File(['TestFileContent'], 'testFileName');
			const testParamsWithFileBody = { ...baseParams, Body: file };
			const expectedTestParamsWithFileBody = {
				...expectedBaseInputParams,
				Body: testParamsWithFileBody.Body,
			};
			const uploader = new AWSS3ProviderManagedUpload(
				testParamsWithFileBody,
				testOpts,
				new events.EventEmitter()
			);
			const data = await uploader.upload();

			expect(data).toBe(expectedTestParamsWithFileBody.Key);
			expect(putObject).toBeCalledWith(
				expect.anything(),
				expectedTestParamsWithFileBody
			);
		});

		test('error case: upload fails', async () => {
			(putObject as jest.Mock).mockRejectedValue('PutObject Mock Error');
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
		const mockBodySlice = jest.fn();
		const mockBody = (length: number) => ({
			length,
			slice: mockBodySlice,
		});

		beforeEach(() => {
			mockBodySlice.mockImplementation((start, end) =>
				Buffer.alloc(end - start)
			);
		});

		test.skip('happy case: upload a body that splits in two parts', async () => {
			(createMultipartUpload as jest.Mock).mockResolvedValue({
				UploadId: testUploadId,
			});
			(uploadPart as jest.Mock).mockImplementation(async (config, input) => {
				config.emitter.emit(SEND_UPLOAD_PROGRESS_EVENT, {
					loaded: (input?.Body as Buffer)?.length,
				});
				return {
					ETag: 'test_etag_' + input.PartNumber,
				};
			});
			(completeMultipartUpload as jest.Mock).mockResolvedValue({
				Key: baseParams.Key,
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
			expect(mockBodySlice).toBeCalledTimes(2);

			// Create multipart upload call
			expect(createMultipartUpload).toBeCalledTimes(1);

			// Next two upload parts call
			expect(uploadPart).toHaveBeenNthCalledWith(
				1,
				expect.anything(),
				expect.objectContaining({
					Bucket: testParams.Bucket,
					Key: 'public/' + testParams.Key,
					PartNumber: 1,
					UploadId: testUploadId,
					SSECustomerAlgorithm: testParams.SSECustomerAlgorithm,
					SSECustomerKey: testParams.SSECustomerKey,
				})
			);
			expect(mockBodySlice).toHaveBeenNthCalledWith(1, 0, defaultPartSize);
			expect(uploadPart).toHaveBeenNthCalledWith(
				2,
				expect.anything(),
				expect.objectContaining({
					Bucket: testParams.Bucket,
					Key: 'public/' + testParams.Key,
					PartNumber: 2,
					UploadId: testUploadId,
					SSECustomerAlgorithm: testParams.SSECustomerAlgorithm,
					SSECustomerKey: testParams.SSECustomerKey,
				})
			);
			expect(mockBodySlice).toHaveBeenNthCalledWith(
				2,
				defaultPartSize,
				defaultPartSize + 1
			);

			// Lastly complete multi part upload call
			expect(completeMultipartUpload).toBeCalledTimes(1);
			expect(completeMultipartUpload).toBeCalledWith(expect.anything(), {
				Bucket: testParams.Bucket,
				Key: 'public/' + testParams.Key,
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
			(createMultipartUpload as jest.Mock).mockResolvedValue({
				UploadId: testUploadId,
			});
			(uploadPart as jest.Mock).mockImplementation(async (config, input) => {
				config.emitter.emit(SEND_UPLOAD_PROGRESS_EVENT, {
					loaded: (input?.Body as Buffer)?.length,
				});
				return {
					ETag: 'test_etag_' + input.PartNumber,
				};
			});
			(completeMultipartUpload as jest.Mock).mockResolvedValue({
				Key: baseParams.Key,
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
			expect(createMultipartUpload).toBeCalledTimes(1);
			expect(uploadPart).toBeCalledTimes(10000);
			expect(completeMultipartUpload).toBeCalledTimes(1);
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
			const wait = (ms: number) =>
				new Promise(resolve => setTimeout(resolve, ms));

			// Setup Spy for S3 service calls and introduce a service failure
			(createMultipartUpload as jest.Mock).mockResolvedValue({
				UploadId: testUploadId,
			});
			(uploadPart as jest.Mock).mockImplementation(async (config, input) => {
				if (input.PartNumber === 2) {
					await wait(100);
					throw new Error('Part 2 just going to fail in 100ms');
				} else {
					await wait(200);
					config.emitter.emit(SEND_UPLOAD_PROGRESS_EVENT, {
						loaded: (input?.Body as Buffer)?.length,
					});
					return {
						ETag: 'test_etag_' + input.PartNumber,
					};
				}
			});
			(completeMultipartUpload as jest.Mock).mockResolvedValue({
				Key: baseParams.Key,
			});

			const emitter = new events.EventEmitter();
			const eventSpy = jest.fn();
			emitter.on('sendUploadProgress', eventSpy);
			const body = mockBody(defaultPartSize + 1);
			const testParams = { ...baseParams, Body: body };
			const expectedParams = {
				...testParams,
				Key: 'public/' + testParams.Key,
			};
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

			expect(createMultipartUpload).toBeCalledTimes(1);
			expect(uploadPart).toBeCalledTimes(2);
			expect(abortMultipartUpload).toBeCalledTimes(1);
			expect(listParts).toBeCalledTimes(1);

			// Create multipart upload call
			expect(createMultipartUpload).toBeCalledWith(
				expect.anything(),
				expectedParams
			);

			// Upload part calls
			const getExpectedUploadPartParams = (partNumber: number) => ({
				...Object.entries(expectedParams)
					.filter(([key, _]) => {
						return !['Body', 'ContentLength', 'ContentType'].includes(key);
					})
					.reduce((obj, [key, val]) => {
						obj[key] = val;
						return obj;
					}, {}),
				PartNumber: partNumber,
				UploadId: testUploadId,
			});

			// First call succeeds
			expect(uploadPart).toHaveBeenNthCalledWith(
				1,
				expect.anything(),
				expect.objectContaining(getExpectedUploadPartParams(1))
			);
			expect(mockBodySlice).toHaveBeenNthCalledWith(1, 0, defaultPartSize);

			// Second call fails
			expect(uploadPart).toHaveBeenNthCalledWith(
				2,
				expect.anything(),
				expect.objectContaining(getExpectedUploadPartParams(2))
			);
			expect(mockBodySlice).toHaveBeenNthCalledWith(
				2,
				defaultPartSize,
				defaultPartSize + 1
			);

			const expectedAbortAndListPartsParams = {
				Bucket: testParams.Bucket,
				Key: 'public/' + testParams.Key,
				UploadId: testUploadId,
			};
			// so we abort the multipart upload
			expect(abortMultipartUpload).toBeCalledWith(
				expect.anything(),
				expectedAbortAndListPartsParams
			);

			// And finally list parts call to verify
			expect(listParts).toBeCalledWith(
				expect.anything(),
				expectedAbortAndListPartsParams
			);

			// As the 'sendUploadProgress' happens when the upload is 100% complete,
			// it won't be called, as an error is thrown before upload completion.
			expect(eventSpy).toBeCalledTimes(0);
		});

		test('error case: cleanup failed', async () => {
			(createMultipartUpload as jest.Mock).mockResolvedValue({
				UploadId: testUploadId,
			});
			(uploadPart as jest.Mock).mockResolvedValue({});
			(listParts as jest.Mock).mockResolvedValue({
				Parts: [
					{
						PartNumber: 1,
					},
				],
			});
			(abortMultipartUpload as jest.Mock).mockResolvedValue({});
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
			(createMultipartUpload as jest.Mock).mockResolvedValue({
				UploadId: testUploadId,
			});
			(uploadPart as jest.Mock).mockImplementation(async (_, params) => ({
				ETag: 'test_etag_' + params.PartNumber,
			}));
			(completeMultipartUpload as jest.Mock).mockRejectedValue(
				new Error('Error completing multipart upload.')
			);
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
