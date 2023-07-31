// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Logger, Hub, Credentials, ICredentials } from '@aws-amplify/core';
import {
	listObjectsV2,
	createMultipartUpload,
	uploadPart,
	headObject,
	getPresignedGetObjectUrl,
	getObject,
	putObject,
	deleteObject,
	copyObject,
} from '../../src/AwsClients/S3';
import { AWSS3Provider as StorageProvider } from '../../src/providers/AWSS3Provider';
import {
	S3CopySource,
	S3CopyDestination,
	StorageOptions,
	S3ProviderGetConfig,
} from '../../src/types';
import { AWSS3UploadTask } from '../../src/providers/AWSS3UploadTask';
import * as StorageUtils from '../../src/common/StorageUtils';

jest.mock('events', function () {
	return {
		EventEmitter: jest.fn().mockImplementation(() => mockEventEmitter),
	};
});

jest.mock('../../src/AwsClients/S3');
jest.mock('@aws-amplify/core/internals/aws-client-utils');

/**
 * NOTE - These test cases use Hub.dispatch but they should
 * actually be using dispatchStorageEvent from Storage
 */

const mockRemoveAllListeners = jest.fn();
const mockEventEmitter = {
	emit: jest.fn(),
	on: jest.fn(),
	removeAllListeners: mockRemoveAllListeners,
};

const mockListObjectsV2 = listObjectsV2 as jest.Mock;
const mockCreateMultipartUpload = createMultipartUpload as jest.Mock;
const mockUploadPart = uploadPart as jest.Mock;
const mockHeadObject = headObject as jest.Mock;
const mockGetPresignedGetObjectUrl = getPresignedGetObjectUrl as jest.Mock;
const mockGetObject = getObject as jest.Mock;
const mockPutObject = putObject as jest.Mock;
const mockDeleteObject = deleteObject as jest.Mock;
const mockCopyObject = copyObject as jest.Mock;

const credentials: ICredentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

const options: StorageOptions = {
	bucket: 'bucket',
	region: 'region',
	credentials,
	level: 'public',
};

const options_no_cred = {
	bucket: 'bucket',
	region: 'region',
	credentials: null,
	level: 'level',
};

afterEach(() => {
	jest.restoreAllMocks();
	jest.clearAllMocks();
});

function mockListObjectsV2ApiWithPages(pages) {
	const continuationToken = 'TEST_TOKEN';
	const listResultObj = {
		Key: 'public/path/itemsKey',
		ETag: 'etag',
		LastModified: 'lastmodified',
		Size: 'size',
	};
	let methodCalls = 0;
	mockListObjectsV2.mockClear();
	mockListObjectsV2.mockImplementation(async (_, input) => {
		let token: string | undefined = undefined;
		methodCalls++;
		if (methodCalls > pages) {
			fail(`listObjectsV2 calls are more than expected. Expected ${pages}`);
		}
		if (input.ContinuationToken === undefined || methodCalls < pages) {
			token = continuationToken;
		}
		if (input.Prefix === 'public/listALLResultsPath') {
			return {
				Contents: [listResultObj],
				NextContinuationToken: token,
			};
		}
	});
}
describe('StorageProvider test', () => {
	let storage: StorageProvider;
	beforeEach(() => {
		storage = new StorageProvider();
		storage.configure(options);
		mockListObjectsV2.mockImplementation(async (_, input) => {
			const resultObj = {
				Key: 'public/path/itemsKey',
				ETag: 'etag',
				LastModified: 'lastmodified',
				Size: 'size',
			};
			if (input.Prefix === 'public/emptyListResultsPath') {
				return {};
			}
			return {
				Contents: [resultObj],
				IsTruncated: false,
			};
		});
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('getCategory test', () => {
		test('happy case', () => {
			expect(storage.getCategory()).toBe('Storage');
		});
	});

	describe('getProviderName test', () => {
		test('happy case', () => {
			expect(storage.getProviderName()).toBe('AWSS3');
		});
	});

	describe('configure test', () => {
		test('standard configuration', () => {
			storage = new StorageProvider();

			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
			};

			const config = storage.configure(aws_options);
			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
				},
			});
		});

		test('configuration for local testing', () => {
			storage = new StorageProvider();

			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
				aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing:
					true,
			};

			const config = storage.configure(aws_options);
			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
					dangerouslyConnectToHttpEndpointForTesting: true,
				},
			});
		});
	});

	describe('get test', () => {
		test('get object without download', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});
			mockGetPresignedGetObjectUrl.mockReturnValueOnce('url');
			expect(await storage.get('key', { download: false })).toBe('url');
			expect(mockGetPresignedGetObjectUrl).toBeCalledWith(
				expect.objectContaining({
					credentials,
				}),
				expect.objectContaining({
					Bucket: options.bucket,
				})
			);
		});

		test('get object with custom response headers', async () => {
			expect.assertions(2);
			const curCredSpyOn = jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => {
					return Promise.resolve(credentials);
				});
			mockGetPresignedGetObjectUrl.mockReturnValueOnce('url');
			const params = {
				cacheControl: 'no-cache',
				contentDisposition: 'attachment; filename="filename.jpg"',
				contentEncoding: 'identity',
				contentLanguage: 'en-US',
				contentType: 'multipart/form-data; boundary=something',
				expires: 123456789,
			};
			expect(await storage.get('key', params)).toBe('url');
			expect(mockGetPresignedGetObjectUrl).toBeCalledWith(
				expect.objectContaining({
					expiration: params.expires,
					signingRegion: options.region,
					signingService: 's3',
					credentials,
				}),
				{
					Bucket: options.bucket,
					Key: 'public/key',
					ResponseCacheControl: params.cacheControl,
					ResponseContentDisposition: params.contentDisposition,
					ResponseContentEncoding: params.contentEncoding,
					ResponseContentLanguage: params.contentLanguage,
					ResponseContentType: params.contentType,
				}
			);
			curCredSpyOn.mockClear();
		});

		test('get object with tracking', async () => {
			expect.assertions(3);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});
			mockGetPresignedGetObjectUrl.mockReturnValueOnce('url');
			const hubDispathSpy = jest.spyOn(Hub, 'dispatch');

			expect(await storage.get('key', { downloaded: false, track: true })).toBe(
				'url'
			);
			expect(mockGetPresignedGetObjectUrl).toBeCalledWith(
				expect.objectContaining({
					region: options.region,
				}),
				expect.objectContaining({
					Key: 'public/key',
					Bucket: options.bucket,
				})
			);
			expect(hubDispathSpy).toBeCalledWith(
				'storage',
				{
					event: 'getSignedUrl',
					data: {
						attrs: { method: 'get', result: 'success' },
					},
					message: 'Signed URL: url',
				},
				'Storage',
				Symbol.for('amplify_default')
			);
		});

		test('get object with download successfully', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const options_with_download = Object.assign({}, options, {
				download: true,
			});
			storage = new StorageProvider();
			storage.configure(options_with_download);
			mockGetObject.mockResolvedValueOnce({ Body: [1, 2] });

			expect(await storage.get('key', { download: true })).toEqual({
				Body: [1, 2],
			});
			expect(getObject).toBeCalledWith(expect.anything(), {
				Bucket: 'bucket',
				Key: 'public/key',
			});
		});

		test.skip('get object with download and progress tracker', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});
			const mockCallback = jest.fn();
			const downloadOptionsWithProgressCallback = Object.assign({}, options, {
				download: true,
				progressCallback: mockCallback,
			});
			storage = new StorageProvider();
			storage.configure(downloadOptionsWithProgressCallback);
			mockGetObject.mockResolvedValueOnce({ Body: [1, 2] });
			expect(await storage.get('key', { download: true })).toEqual({
				Body: [1, 2],
			});
			expect(mockEventEmitter.on).toBeCalledWith(
				'sendDownloadProgress',
				expect.any(Function)
			);
			// Get the anonymous function called by the emitter
			const emitterOnFn = mockEventEmitter.on.mock.calls[0][1];
			// Manully invoke it for testing
			emitterOnFn('arg');
			expect(mockCallback).toBeCalledWith('arg');
			expect(mockRemoveAllListeners).toHaveBeenCalled();
		});

		test('get object with incorrect progressCallback type', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});
			const loggerSpy = jest.spyOn(Logger.prototype, '_log');
			const downloadOptionsWithProgressCallback = Object.assign({}, options);
			storage = new StorageProvider();
			storage.configure(downloadOptionsWithProgressCallback);
			mockGetObject.mockResolvedValueOnce({ Body: [1, 2] });
			await storage.get('key', {
				download: true,
				progressCallback:
					'this is not a function' as unknown as S3ProviderGetConfig['progressCallback'], // this is intentional
			});
			expect(loggerSpy).toHaveBeenCalledWith(
				'WARN',
				'progressCallback should be a function, not a string'
			);
		});

		test('get object with download with failure', async () => {
			expect.assertions(1);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			mockGetObject.mockRejectedValueOnce('err');
			try {
				await storage.get('key', { download: true });
				fail('expect to throw error');
			} catch (e) {
				expect(e).toBe('err');
			}
		});

		test('get object with private option', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({
						identityId: 'id',
					});
				});
			});
			mockGetPresignedGetObjectUrl.mockReturnValueOnce('url');
			expect(await storage.get('key', { level: 'private' })).toBe('url');
			expect(mockGetPresignedGetObjectUrl).toBeCalledWith(
				expect.objectContaining({
					region: options.region,
				}),
				expect.objectContaining({
					Bucket: options.bucket,
					Key: 'private/id/key',
				})
			);
		});

		test('sets an empty custom public key', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({
						identityId: 'id',
					});
				});
			});
			mockGetPresignedGetObjectUrl.mockReturnValueOnce('url');
			await storage.get('my_key', { customPrefix: { public: '' } });
			expect(mockGetPresignedGetObjectUrl).toBeCalledWith(
				expect.objectContaining({
					region: options.region,
				}),
				expect.objectContaining({
					Bucket: options.bucket,
					Key: 'my_key',
				})
			);
		});

		test('sets a custom key for public accesses', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({
						identityId: 'id',
					});
				});
			});
			mockGetPresignedGetObjectUrl.mockReturnValueOnce('url');

			await storage.get('my_key', { customPrefix: { public: '123/' } });
			expect(mockGetPresignedGetObjectUrl).toBeCalledWith(
				expect.objectContaining({
					region: options.region,
				}),
				expect.objectContaining({
					Bucket: options.bucket,
					Key: '123/my_key',
				})
			);
		});

		test('get object with expires option', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			mockGetPresignedGetObjectUrl.mockReturnValueOnce('url');

			expect(await storage.get('key', { expires: 1200 })).toBe('url');
			expect(mockGetPresignedGetObjectUrl).toBeCalledWith(
				expect.objectContaining({
					region: options.region,
					expiration: 1200,
				}),
				expect.objectContaining({
					Bucket: options.bucket,
					Key: 'public/key',
				})
			);
		});

		test('get object with default expires option', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			mockGetPresignedGetObjectUrl.mockReturnValueOnce('url');

			expect(await storage.get('key')).toBe('url');
			expect(mockGetPresignedGetObjectUrl).toBeCalledWith(
				expect.objectContaining({
					region: options.region,
					expiration: 900,
				}),
				expect.objectContaining({
					Bucket: options.bucket,
					Key: 'public/key',
				})
			);
		});

		test('get object with identityId option', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			mockGetPresignedGetObjectUrl.mockReturnValueOnce('url');

			expect(
				await storage.get('key', {
					level: 'protected',
					identityId: 'identityId',
				})
			).toBe('url');
			expect(mockGetPresignedGetObjectUrl).toBeCalledWith(
				expect.objectContaining({
					region: options.region,
				}),
				expect.objectContaining({
					Bucket: options.bucket,
					Key: 'protected/identityId/key',
				})
			);
		});

		test('credentials not ok', async () => {
			expect.assertions(1);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});

			storage = new StorageProvider();
			storage.configure(options_no_cred);

			try {
				await storage.get('key', {});
				fail('this test should have thrown an error');
			} catch (e) {
				expect(e).not.toBeNull();
			}
		});

		test('always ask for the current credentials', async () => {
			mockGetPresignedGetObjectUrl.mockReturnValue('url');
			const curCredSpyOn = jest
				.spyOn(Credentials, 'get')
				.mockImplementation(() => {
					return new Promise((res, rej) => {
						res({
							cred: 'cred1',
						});
					});
				});

			await storage.get('key', { download: false });

			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({
						cred: 'cred2',
					});
				});
			});

			await storage.get('key', { download: false });

			expect(curCredSpyOn.mock.calls.length).toBe(2);

			curCredSpyOn.mockClear();
		});

		describe('get test with validateObjectExistence option', () => {
			beforeEach(() => {
				jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
					return Promise.resolve(credentials);
				});
			});

			test('get existing object with validateObjectExistence option', async () => {
				expect.assertions(4);
				const options_with_validateObjectExistence = Object.assign(
					{},
					options,
					{
						validateObjectExistence: true,
					}
				);
				storage = new StorageProvider();
				storage.configure(options_with_validateObjectExistence);
				mockGetPresignedGetObjectUrl.mockReturnValueOnce('url');
				const dispatchSpy = jest.spyOn(StorageUtils, 'dispatchStorageEvent');
				expect(
					await storage.get('key', {
						validateObjectExistence: true,
						track: true,
					})
				).toBe('url');
				expect(dispatchSpy).toHaveBeenCalledTimes(1);
				expect(dispatchSpy).toBeCalledWith(
					true,
					'getSignedUrl',
					{ method: 'get', result: 'success' },
					null,
					'Signed URL: url'
				);
				expect(mockGetPresignedGetObjectUrl).toBeCalledWith(
					expect.objectContaining({
						region: options.region,
					}),
					expect.objectContaining({
						Bucket: options.bucket,
						Key: 'public/key',
					})
				);
			});

			test('get non-existing object with validateObjectExistence option', async () => {
				expect.assertions(2);
				const dispatchSpy = jest.spyOn(StorageUtils, 'dispatchStorageEvent');
				mockHeadObject.mockRejectedValueOnce(
					Object.assign(new Error(), {
						$metadata: { httpStatusCode: 404 },
						name: 'NotFound',
					})
				);
				try {
					await storage.get('key', {
						validateObjectExistence: true,
						track: true,
					});
				} catch (error) {
					expect(error.$metadata.httpStatusCode).toBe(404);
					expect(dispatchSpy).toBeCalledWith(
						true,
						'getSignedUrl',
						{ method: 'get', result: 'failed' },
						null,
						'key not found'
					);
				}
			});
		});
	});

	describe('getProperties test', () => {
		beforeEach(() => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});
		});

		test('getProperties successfully', async () => {
			expect.assertions(4);
			const dispatchSpy = jest.spyOn(StorageUtils, 'dispatchStorageEvent');
			const metadata = { key: 'value' };
			mockHeadObject.mockReturnValueOnce({
				ContentLength: '100',
				ContentType: 'text/plain',
				ETag: 'etag',
				LastModified: 'lastmodified',
				Metadata: { key: 'value' },
			});
			expect(await storage.getProperties('key')).toEqual({
				contentLength: '100',
				contentType: 'text/plain',
				eTag: 'etag',
				lastModified: 'lastmodified',
				metadata,
			});
			expect(dispatchSpy).toHaveBeenCalledTimes(1);
			expect(dispatchSpy).toBeCalledWith(
				false,
				'getProperties',
				{ method: 'getProperties', result: 'success' },
				null,
				'getProperties successful for key'
			);
			expect(headObject).toBeCalledWith(expect.anything(), {
				Bucket: 'bucket',
				Key: 'public/key',
			});
		});

		test('get properties of non-existing object', async () => {
			expect.assertions(2);
			const dispatchSpy = jest.spyOn(StorageUtils, 'dispatchStorageEvent');
			mockHeadObject.mockRejectedValueOnce(
				Object.assign(new Error(), {
					$metadata: { httpStatusCode: 404 },
					name: 'NotFound',
				})
			);
			try {
				await storage.getProperties('invalid_key');
			} catch (error) {
				expect(error.$metadata.httpStatusCode).toBe(404);
				expect(dispatchSpy).toBeCalledWith(
					false,
					'getProperties',
					{ method: 'getProperties', result: 'failed' },
					null,
					'invalid_key not found'
				);
			}
		});
	});

	describe('put test', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		test('put object successfully', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			expect(await storage.put('key', 'object', { acl: 'public' })).toEqual({
				key: 'key',
			});
			expect(putObject).toBeCalledWith(expect.anything(), {
				ACL: 'public',
				Body: 'object',
				Bucket: 'bucket',
				ContentType: 'binary/octet-stream',
				Key: 'public/key',
			});
		});

		test('put object with track', async () => {
			expect.assertions(3);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const hubDispathSpy = jest.spyOn(Hub, 'dispatch');
			expect(await storage.put('key', 'object', { track: true })).toEqual({
				key: 'key',
			});
			expect(putObject).toBeCalledWith(expect.anything(), {
				Bucket: 'bucket',
				Key: 'public/key',
				ContentType: 'binary/octet-stream',
				Body: 'object',
			});
			expect(hubDispathSpy).toBeCalledWith(
				'storage',
				{
					event: 'upload',
					data: {
						attrs: {
							method: 'put',
							result: 'success',
						},
					},
					message: 'Upload success for key',
				},
				'Storage',
				Symbol.for('amplify_default')
			);
		});

		test('put object failed', async () => {
			expect.assertions(1);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			mockPutObject.mockRejectedValueOnce('err');
			try {
				await storage.put('key', 'object', {});
				fail('this test is suppose to fail');
			} catch (e) {
				expect(e).toBe('err');
			}
		});

		test('put object with private and contenttype specified', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({
						identityId: 'id',
					});
				});
			});
			expect(
				await storage.put('key', 'object', {
					level: 'private',
					contentType: 'text/plain',
				})
			).toEqual({ key: 'key' });
			expect(putObject).toBeCalledWith(expect.anything(), {
				Body: 'object',
				Bucket: 'bucket',
				ContentType: 'text/plain',
				Key: 'private/id/key',
			});
		});

		test('put object with extra config passed to s3 calls', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, _rej) => {
					res({
						identityId: 'id',
					});
				});
			});
			const date = new Date();
			const metadata = { key: 'value' };
			expect(
				await storage.put('key', 'object', {
					level: 'private',
					contentType: 'text/plain',
					cacheControl: 'no-cache',
					contentDisposition: 'inline',
					contentEncoding: 'gzip',
					expires: date,
					metadata,
					tagging: 'key1=value1',
					serverSideEncryption: 'AES256',
					SSECustomerAlgorithm: 'AES256',
					SSECustomerKey: 'key',
					SSECustomerKeyMD5: 'md5',
					SSEKMSKeyId: 'id',
				})
			).toEqual({ key: 'key' });
			expect(putObject).toBeCalledWith(expect.anything(), {
				Body: 'object',
				Bucket: 'bucket',
				ContentType: 'text/plain',
				Key: 'private/id/key',
				CacheControl: 'no-cache',
				ContentEncoding: 'gzip',
				ContentDisposition: 'inline',
				Expires: date,
				Metadata: metadata,
				Tagging: 'key1=value1',
				SSECustomerAlgorithm: 'AES256',
				SSECustomerKey: 'key',
				SSECustomerKeyMD5: 'md5',
				ServerSideEncryption: 'AES256',
				SSEKMSKeyId: 'id',
			});
		});

		test.skip('progress callback should be called', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, _rej) => {
					res({
						identityId: 'id',
					});
				});
			});
			const mockCallback = jest.fn();
			await storage.put('key', 'object', {
				progressCallback: mockCallback,
			});
			expect(mockEventEmitter.on).toBeCalledWith(
				'sendUploadProgress',
				expect.any(Function)
			);
			const emitterOnFn = mockEventEmitter.on.mock.calls[0][1];
			// Manually invoke for testing
			emitterOnFn('arg');
			expect(mockCallback).toBeCalledWith('arg');
		});

		test('non-function progress callback should give a warning', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, _rej) => {
					res({
						identityId: 'id',
					});
				});
			});
			const loggerSpy = jest.spyOn(Logger.prototype, '_log');
			await storage.put('key', 'object', {
				progressCallback:
					'hello' as unknown as S3ProviderGetConfig['progressCallback'], // this is intentional
			});
			expect(loggerSpy).toHaveBeenCalledWith(
				'WARN',
				'progressCallback should be a function, not a string'
			);
		});

		test('put (resumable upload) returns instance of AWSS3UploadTask', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			const file = new File(['TestFileContent'], 'testFileName');
			const testUploadId = 'testUploadId';
			mockCreateMultipartUpload.mockResolvedValueOnce({
				UploadId: testUploadId,
			});
			mockUploadPart.mockImplementationOnce(async (_, input) => ({
				ETag: 'test_etag_' + input.PartNumber,
			}));
			const uploadTask = storage.put('key', file, {
				resumable: true,
			});

			expect(uploadTask instanceof AWSS3UploadTask).toEqual(true);
		});

		test('put (resumable upload) with extra config passed to s3 call', async () => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});

			const file = new File(['TestFileContent'], 'testFileName');
			const testUploadId = 'testUploadId';

			mockCreateMultipartUpload.mockResolvedValueOnce({
				UploadId: testUploadId,
			});
			mockUploadPart.mockImplementationOnce(async (_, input) => ({
				ETag: 'test_etag_' + input.PartNumber,
			}));
			const date = new Date();
			const metadata = { key: 'value' };
			const task = storage.put('key', file, {
				resumable: true,
				contentType: 'application/pdf',
				cacheControl: 'no-cache',
				contentDisposition: 'inline',
				contentEncoding: 'gzip',
				expires: date,
				metadata,
				tagging: 'key1=value1',
				serverSideEncryption: 'AES256',
				SSECustomerAlgorithm: 'AES256',
				SSECustomerKey: 'key',
				SSECustomerKeyMD5: 'md5',
				SSEKMSKeyId: 'id',
				acl: 'public',
				progressCallback: async () => {
					expect(putObject).toBeCalledWith(expect.anything(), {
						Body: file,
						Bucket: 'bucket',
						ContentType: 'application/pdf',
						Key: 'keya',
						CacheControl: 'no-cache',
						ContentEncoding: 'gzip',
						ContentDisposition: 'inline',
						Expires: date,
						Metadata: metadata,
						Tagging: 'key1=value1',
						SSECustomerAlgorithm: 'AES256',
						SSECustomerKey: 'key',
						SSECustomerKeyMD5: 'md5',
						ServerSideEncryption: 'AES256',
						SSEKMSKeyId: 'id',
						ACL: 'public',
					});
					await (task as AWSS3UploadTask)._cancel();
				},
			});
		});
	});

	describe('remove test', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		test('remove object successfully', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			mockDeleteObject.mockResolvedValueOnce('data');
			expect(await storage.remove('key', {})).toBe('data');
			expect(deleteObject).toBeCalledWith(expect.anything(), {
				Bucket: 'bucket',
				Key: 'public/key',
			});
		});

		test('remove object with track', async () => {
			expect.assertions(3);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			mockDeleteObject.mockResolvedValueOnce('data');
			const hubDispathSpy = jest.spyOn(Hub, 'dispatch');
			expect(await storage.remove('key', { track: true })).toBe('data');
			expect(deleteObject).toBeCalledWith(expect.anything(), {
				Bucket: 'bucket',
				Key: 'public/key',
			});
			expect(hubDispathSpy).toBeCalledWith(
				'storage',
				{
					event: 'delete',
					data: {
						attrs: { method: 'remove', result: 'success' },
					},
					message: 'Deleted key successfully',
				},
				'Storage',
				Symbol.for('amplify_default')
			);
		});

		test('remove object failed', async () => {
			expect.assertions(1);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			mockDeleteObject.mockRejectedValueOnce('err');

			try {
				await storage.remove('key', {});
				fail('this test is expected to throw');
			} catch (e) {
				expect(e).toBe('err');
			}
		});

		test('remove object with private', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({
						identityId: 'id',
					});
				});
			});

			mockDeleteObject.mockResolvedValueOnce('data');

			expect(await storage.remove('key', { level: 'private' })).toBe('data');
			expect(deleteObject).toBeCalledWith(expect.anything(), {
				Bucket: 'bucket',
				Key: 'private/id/key',
			});
		});

		test('credentials not ok', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});
			storage = new StorageProvider();
			storage.configure(options_no_cred);
			expect.assertions(1);
			try {
				await storage.remove('key', {});
			} catch (e) {
				expect(e).not.toBeNull();
			}
		});
	});

	describe('list test', () => {
		const resultObj = {
			eTag: 'etag',
			key: 'path/itemsKey',
			lastModified: 'lastmodified',
			size: 'size',
		};
		const listResultObj = {
			Key: 'public/path/itemsKey',
			ETag: 'etag',
			LastModified: 'lastmodified',
			Size: 'size',
		};
		function commandInput(token) {
			return {
				Bucket: 'bucket',
				Prefix: 'public/listALLResultsPath',
				MaxKeys: 1000,
				ContinuationToken: token,
			};
		}
		const listResult = [resultObj, resultObj, resultObj];

		test('list object successfully having three pages', async () => {
			expect.assertions(5);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			mockListObjectsV2ApiWithPages(3);
			let response = await storage.list('listALLResultsPath', {
				level: 'public',
				pageSize: 'ALL',
			});
			expect(response.results).toEqual(listResult);
			expect(response.hasNextToken).toEqual(false);
			// listing three times for three pages
			expect(listObjectsV2).toHaveBeenCalledTimes(3);
			// first input recieves undefined as the Continuation Token
			expect(listObjectsV2).toHaveBeenNthCalledWith(
				1,
				expect.anything(),
				commandInput(undefined)
			);
			// last input recieves TEST_TOKEN as the Continuation Token
			expect(listObjectsV2).toHaveBeenNthCalledWith(
				3,
				expect.anything(),
				commandInput('TEST_TOKEN')
			);
			mockListObjectsV2.mockClear();
		});

		test('list objects with zero results', async () => {
			expect.assertions(2);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			let response = await storage.list('emptyListResultsPath', {
				level: 'public',
			});

			expect(response.results).toEqual([]);
			expect(listObjectsV2).toHaveBeenCalledWith(expect.anything(), {
				Bucket: 'bucket',
				MaxKeys: 1000,
				Prefix: 'public/emptyListResultsPath',
			});
			mockListObjectsV2.mockClear();
		});

		test('list object with track having three pages', async () => {
			expect.assertions(5);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			mockListObjectsV2ApiWithPages(3);
			let response = await storage.list('listALLResultsPath', {
				level: 'public',
				track: true,
				pageSize: 'ALL',
			});
			expect(response.results).toEqual(listResult);
			expect(response.hasNextToken).toEqual(false);
			// listing three times for three pages
			expect(listObjectsV2).toHaveBeenCalledTimes(3);
			// first input recieves undefined as the Continuation Token
			expect(listObjectsV2).toHaveBeenNthCalledWith(
				1,
				expect.anything(),
				commandInput(undefined)
			);
			// last input recieves TEST_TOKEN as the Continuation Token
			expect(listObjectsV2).toHaveBeenNthCalledWith(
				3,
				expect.anything(),
				commandInput('TEST_TOKEN')
			);
			mockListObjectsV2.mockClear();
		});

		test('list object with pageSize and nextToken', async () => {
			expect.assertions(4);
			const curCredSpyOn = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res({});
					});
				});
			mockListObjectsV2.mockImplementationOnce(async (_, input) => {
				if (input.Prefix === 'public/listWithTokenResultsPath') {
					return {
						Contents: [listResultObj],
						NextContinuationToken: 'TEST_TOKEN',
						IsTruncated: true,
					};
				}
				return 'data';
			});
			const response = await storage.list('listWithTokenResultsPath', {
				level: 'public',
				pageSize: 1,
				nextToken: 'TEST_TOKEN',
			});
			expect(response.results).toEqual([
				{
					eTag: 'etag',
					key: 'path/itemsKey',
					lastModified: 'lastmodified',
					size: 'size',
				},
			]);
			expect(response.nextToken).toEqual('TEST_TOKEN');
			expect(response.hasNextToken).toEqual(true);
			expect(listObjectsV2).toHaveBeenCalledWith(expect.anything(), {
				Bucket: 'bucket',
				Prefix: 'public/listWithTokenResultsPath',
				ContinuationToken: 'TEST_TOKEN',
				MaxKeys: 1,
			});
			mockListObjectsV2.mockClear();
			curCredSpyOn.mockClear();
		});

		test('list object failed', async () => {
			expect.assertions(1);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});
			mockListObjectsV2.mockRejectedValueOnce('err');
			try {
				await storage.list('path', {});
			} catch (e) {
				expect(e).toBe('err');
			}
		});

		test('credentials not ok', async () => {
			expect.assertions(1);
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});
			storage = new StorageProvider();
			storage.configure(options_no_cred);
			try {
				await storage.list('path', {});
			} catch (e) {
				expect(e).not.toBeNull();
			}
		});
	});

	describe('copy test', () => {
		beforeEach(() => {
			jest.spyOn(Credentials, 'get').mockImplementation(() => {
				return Promise.resolve(credentials);
			});
		});

		afterEach(() => {
			jest.clearAllMocks();
			jest.restoreAllMocks();
		});

		test('copy object successfully', async () => {
			mockCopyObject.mockResolvedValueOnce('data');
			expect(await storage.copy({ key: 'src' }, { key: 'dest' })).toEqual({
				key: 'dest',
			});
			expect(copyObject).toBeCalledWith(expect.anything(), {
				Bucket: 'bucket',
				// Should default to public if no level is specified
				CopySource: 'bucket/public/src',
				Key: 'public/dest',
				MetadataDirective: 'COPY',
			});
			expect(copyObject).toBeCalledTimes(1);
		});

		test('copy with invalid source key should throw error', async () => {
			// No src key
			await expect(
				storage.copy({ level: 'public' } as S3CopySource, {
					key: 'dest',
					level: 'public',
				})
			).rejects.toThrowError(
				'source param should be an object with the property "key" with value of type string'
			);
			// wrong key type
			await expect(
				storage.copy({ level: 'public', key: 123 } as unknown as S3CopySource, {
					key: 'dest',
					level: 'public',
				})
			).rejects.toThrowError(
				'source param should be an object with the property "key" with value of type string'
			);
		});

		test('copy with invalid destination key should throw error', async () => {
			// No dest key
			await expect(
				storage.copy({ key: 'src', level: 'public' }, {
					level: 'public',
				} as S3CopyDestination)
			).rejects.toThrowError(
				'destination param should be an object with the property "key" with value of type string'
			);

			// wrong key type
			await expect(
				storage.copy({ key: 'src', level: 'public' }, {
					key: 123,
					level: 'public',
				} as unknown as S3CopyDestination)
			).rejects.toThrowError(
				'destination param should be an object with the property "key" with value of type string'
			);
		});

		test('copy object with track', async () => {
			mockCopyObject.mockResolvedValueOnce('data');
			const hubDispathSpy = jest.spyOn(Hub, 'dispatch');

			await storage.copy({ key: 'src' }, { key: 'dest' }, { track: true });
			expect(copyObject).toBeCalledTimes(1);
			expect(hubDispathSpy).toBeCalledWith(
				'storage',
				{
					event: 'copy',
					data: {
						attrs: {
							method: 'copy',
							result: 'success',
						},
					},
					message: 'Copy success from src to dest',
				},
				'Storage',
				Symbol.for('amplify_default')
			);
		});

		test('copy object with level and identityId specified', async () => {
			mockCopyObject.mockResolvedValueOnce('data');
			await storage.copy(
				{ key: 'src', level: 'protected', identityId: 'identityId2' },
				{ key: 'dest', level: 'private' }
			);

			expect(copyObject).toBeCalledWith(expect.anything(), {
				Bucket: 'bucket',
				CopySource: 'bucket/protected/identityId2/src',
				Key: 'private/identityId/dest',
				MetadataDirective: 'COPY',
			});
		});

		test('copy with custom s3 configs', async () => {
			mockCopyObject.mockResolvedValueOnce('data');
			const date = new Date();
			await storage.copy(
				{ key: 'src', level: 'protected' },
				{ key: 'dest', level: 'protected' },
				{
					acl: 'private',
					bucket: 'bucket',
					cacheControl: 'cacheControl',
					expires: date,
					serverSideEncryption: 'serverSideEncryption',
					SSECustomerAlgorithm: 'SSECustomerAlgorithm',
					SSECustomerKey: 'SSECustomerKey',
					SSECustomerKeyMD5: 'SSECustomerKeyMD5',
					SSEKMSKeyId: 'SSEKMSKeyId',
				}
			);

			expect(copyObject).toBeCalledWith(expect.anything(), {
				ACL: 'private',
				Bucket: 'bucket',
				CopySource: 'bucket/protected/identityId/src',
				CacheControl: 'cacheControl',
				Expires: date,
				ServerSideEncryption: 'serverSideEncryption',
				Key: 'protected/identityId/dest',
				SSECustomerAlgorithm: 'SSECustomerAlgorithm',
				SSECustomerKey: 'SSECustomerKey',
				SSECustomerKeyMD5: 'SSECustomerKeyMD5',
				SSEKMSKeyId: 'SSEKMSKeyId',
				MetadataDirective: 'COPY',
			});
		});

		test('copy object failed', async () => {
			mockCopyObject.mockImplementationOnce(async () => {
				throw new Error('err');
			});
			await expect(
				storage.copy({ key: 'src' }, { key: 'dest' })
			).rejects.toThrow('err');
			expect(copyObject).toBeCalledTimes(1);
		});

		test('credentials not ok', async () => {
			jest.spyOn(Credentials, 'get').mockReset();
			storage = new StorageProvider();
			storage.configure(options_no_cred);
			await expect(
				storage.copy({ key: 'src' }, { key: 'dest' })
			).rejects.toThrowError('No credentials');
		});
	});
});
