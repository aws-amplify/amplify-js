/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import StorageProvider from '../../src/providers/AWSS3Provider';
import { Hub, Credentials } from '@aws-amplify/core';
import * as formatURL from '@aws-sdk/util-format-url';
import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';

/**
 * NOTE - These test cases use Hub.dispatch but they should
 * actually be using dispatchStorageEvent from Storage
 */

S3Client.prototype.send = jest.fn(async command => {
	if (command instanceof ListObjectsCommand) {
		if (command.input.Prefix === 'public/emptyListResultsPath') {
			return {};
		}
		return {
			Contents: [
				{
					Key: 'public/path/itemsKey',
					ETag: 'etag',
					LastModified: 'lastmodified',
					Size: 'size',
				},
			],
		};
	}
	return 'data';
});

S3RequestPresigner.prototype.presign = jest.fn(async (request, expires) => {
	return (Promise as any).resolve();
});

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

const options = {
	bucket: 'bucket',
	region: 'region',
	credentials,
	level: 'level',
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

describe('StorageProvider test', () => {
	describe('getCategory test', () => {
		test('happy case', () => {
			const storage = new StorageProvider();
			storage.configure(options);
			expect(storage.getCategory()).toBe('Storage');
		});
	});

	describe('getProviderName test', () => {
		test('happy case', () => {
			const storage = new StorageProvider();
			storage.configure(options);
			expect(storage.getProviderName()).toBe('AWSS3');
		});
	});

	describe('configure test', () => {
		test('standard configuration', () => {
			const storage = new StorageProvider();

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
			const storage = new StorageProvider();

			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
				aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing: true,
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
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});
			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3RequestPresigner.prototype, 'presign');
			jest.spyOn(formatURL, 'formatUrl').mockReturnValueOnce('url');

			expect.assertions(3);
			expect(await storage.get('key', { downloaded: false })).toBe('url');
			expect(spyon.mock.calls[0][0].path).toEqual('/public/key');
			expect(spyon.mock.calls[0][0].hostname).toEqual(
				options.bucket + '.s3.' + options.region + '.amazonaws.com'
			);
		});

		test('get object with custom response headers', async () => {
			const curCredSpyOn = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return Promise.resolve(credentials);
				});
			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3RequestPresigner.prototype, 'presign');
			jest.spyOn(formatURL, 'formatUrl').mockReturnValueOnce('url');
			expect.assertions(4);
			expect(
				await storage.get('key', {
					cacheControl: 'no-cache',
					contentDisposition: 'attachment; filename="filename.jpg"',
					contentEncoding: 'identity',
					contentLanguage: 'en-US',
					contentType: 'multipart/form-data; boundary=something',
					expires: 123456789,
				})
			).toBe('url');
			expect(spyon.mock.calls[0][0].query).toEqual({
				'response-cache-control': 'no-cache',
				'response-content-disposition': 'attachment; filename="filename.jpg"',
				'response-content-encoding': 'identity',
				'response-content-language': 'en-US',
				'response-content-type': 'multipart/form-data; boundary=something',
				'x-id': 'GetObject',
			});
			expect(spyon.mock.calls[0][0].path).toEqual('/public/key');
			expect(spyon.mock.calls[0][0].hostname).toEqual(
				options.bucket + '.s3.' + options.region + '.amazonaws.com'
			);
			spyon.mockClear();
			curCredSpyOn.mockClear();
		});

		test('get object with tracking', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3RequestPresigner.prototype, 'presign');
			jest.spyOn(formatURL, 'formatUrl').mockReturnValueOnce('url');
			const spyon2 = jest.spyOn(Hub, 'dispatch');

			expect.assertions(4);
			expect(await storage.get('key', { downloaded: false, track: true })).toBe(
				'url'
			);
			expect(spyon.mock.calls[0][0].path).toEqual('/public/key');
			expect(spyon.mock.calls[0][0].hostname).toEqual(
				options.bucket + '.s3.' + options.region + '.amazonaws.com'
			);
			expect(spyon2).toBeCalledWith(
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
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return Promise.resolve(credentials);
			});

			const options_with_download = Object.assign({}, options, {
				download: true,
			});
			const storage = new StorageProvider();
			storage.configure(options_with_download);
			const spyon = jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementationOnce(async params => {
					return { Body: [1, 2] };
				});

			expect.assertions(2);
			expect(await storage.get('key', { download: true })).toEqual({
				Body: [1, 2],
			});
			expect(spyon.mock.calls[0][0].input).toEqual({
				Bucket: 'bucket',
				Key: 'public/key',
			});
		});

		test('get object with download with failure', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementationOnce(async params => {
					throw 'err';
				});

			expect.assertions(1);
			try {
				await storage.get('key', { download: true });
			} catch (e) {
				expect(e).toBe('err');
			}
		});

		test('get object with private option', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({
						identityId: 'id',
					});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3RequestPresigner.prototype, 'presign');
			jest.spyOn(formatURL, 'formatUrl').mockReturnValueOnce('url');

			expect.assertions(3);
			expect(await storage.get('key', { level: 'private' })).toBe('url');
			expect(spyon.mock.calls[0][0].path).toEqual('/private/id/key');
			expect(spyon.mock.calls[0][0].hostname).toEqual(
				options.bucket + '.s3.' + options.region + '.amazonaws.com'
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
			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3RequestPresigner.prototype, 'presign');
			jest.spyOn(formatURL, 'formatUrl').mockReturnValueOnce('url');
			await storage.get('my_key', { customPrefix: { public: '' } });
			expect(spyon.mock.calls[0][0].path).toEqual('/my_key');
			expect(spyon.mock.calls[0][0].hostname).toEqual(
				options.bucket + '.s3.' + options.region + '.amazonaws.com'
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

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3RequestPresigner.prototype, 'presign');
			jest.spyOn(formatURL, 'formatUrl').mockReturnValueOnce('url');

			await storage.get('my_key', { customPrefix: { public: '123/' } });
			expect(spyon.mock.calls[0][0].path).toEqual('/123/my_key');
			expect(spyon.mock.calls[0][0].hostname).toEqual(
				options.bucket + '.s3.' + options.region + '.amazonaws.com'
			);
		});

		test('get object with expires option', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3RequestPresigner.prototype, 'presign');
			jest.spyOn(formatURL, 'formatUrl').mockReturnValueOnce('url');

			expect.assertions(4);
			expect(await storage.get('key', { expires: 1200 })).toBe('url');
			expect(spyon.mock.calls[0][0].path).toEqual('/public/key');
			expect(spyon.mock.calls[0][0].hostname).toEqual(
				options.bucket + '.s3.' + options.region + '.amazonaws.com'
			);

			expect(spyon.mock.calls[0][1].expiresIn).toBe(1200);
		});

		test('get object with default expires option', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3RequestPresigner.prototype, 'presign');
			jest.spyOn(formatURL, 'formatUrl').mockReturnValueOnce('url');

			expect.assertions(4);
			expect(await storage.get('key')).toBe('url');
			expect(spyon.mock.calls[0][0].path).toEqual('/public/key');
			expect(spyon.mock.calls[0][0].hostname).toEqual(
				options.bucket + '.s3.' + options.region + '.amazonaws.com'
			);

			expect(spyon.mock.calls[0][1].expiresIn).toBe(900);
		});

		test('get object with identityId option', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3RequestPresigner.prototype, 'presign');
			jest.spyOn(formatURL, 'formatUrl').mockReturnValueOnce('url');

			expect.assertions(3);
			expect(
				await storage.get('key', {
					level: 'protected',
					identityId: 'identityId',
				})
			).toBe('url');
			expect(spyon.mock.calls[0][0].path).toEqual('/protected/identityId/key');
			expect(spyon.mock.calls[0][0].hostname).toEqual(
				options.bucket + '.s3.' + options.region + '.amazonaws.com'
			);
		});

		test('credentials not ok', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});

			const storage = new StorageProvider();
			storage.configure(options_no_cred);
			expect.assertions(1);

			try {
				await storage.get('key', {});
			} catch (e) {
				expect(e).not.toBeNull();
			}
		});

		test('always ask for the current credentials', async () => {
			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3RequestPresigner.prototype, 'presign');
			jest.spyOn(formatURL, 'formatUrl').mockReturnValue('url');
			const curCredSpyOn = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res({
							cred: 'cred1',
						});
					});
				});

			await storage.get('key', { downloaded: false });

			const curCredSpyOn2 = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res({
							cred: 'cred2',
						});
					});
				});

			await storage.get('key', { downloaded: false });

			expect(curCredSpyOn.mock.calls.length).toBe(2);

			curCredSpyOn.mockClear();
		});
	});

	describe('put test', () => {
		test('put object successfully', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3Client.prototype, 'send');

			expect.assertions(2);
			expect(await storage.put('key', 'object', { acl: 'public' })).toEqual({
				key: 'key',
			});

			expect(spyon.mock.calls[0][0].input).toEqual({
				ACL: 'public',
				Body: 'object',
				Bucket: 'bucket',
				ContentType: 'binary/octet-stream',
				Key: 'public/key',
			});
		});

		test('put object with track', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3Client.prototype, 'send');
			const spyon2 = jest.spyOn(Hub, 'dispatch');

			expect.assertions(3);
			expect(await storage.put('key', 'object', { track: true })).toEqual({
				key: 'key',
			});
			expect(spyon.mock.calls[0][0].input).toEqual({
				Body: 'object',
				Bucket: 'bucket',
				ContentType: 'binary/octet-stream',
				Key: 'public/key',
			});
			expect(spyon2).toBeCalledWith(
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
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementationOnce(async params => {
					throw 'err';
				});

			expect.assertions(1);
			try {
				await storage.put('key', 'object', {});
			} catch (e) {
				expect(e).toBe('err');
			}
		});

		test('put object with private and contenttype specified', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({
						identityId: 'id',
					});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3Client.prototype, 'send');

			expect.assertions(2);
			expect(
				await storage.put('key', 'object', {
					level: 'private',
					contentType: 'text/plain',
				})
			).toEqual({ key: 'key' });
			expect(spyon.mock.calls[0][0].input).toEqual({
				Body: 'object',
				Bucket: 'bucket',
				ContentType: 'text/plain',
				Key: 'private/id/key',
			});
		});

		test('credentials not ok', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});

			const storage = new StorageProvider();
			storage.configure(options_no_cred);
			expect.assertions(1);
			try {
				await storage.put('key', 'obj', {});
			} catch (e) {
				expect(e).not.toBeNull();
			}
		});
	});

	describe('remove test', () => {
		test('remove object successfully', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3Client.prototype, 'send');

			expect.assertions(2);
			expect(await storage.remove('key', {})).toBe('data');
			expect(spyon.mock.calls[0][0].input).toEqual({
				Bucket: 'bucket',
				Key: 'public/key',
			});
		});

		test('remove object with track', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3Client.prototype, 'send');
			const spyon2 = jest.spyOn(Hub, 'dispatch');

			expect.assertions(3);
			expect(await storage.remove('key', { track: true })).toBe('data');
			expect(spyon.mock.calls[0][0].input).toEqual({
				Bucket: 'bucket',
				Key: 'public/key',
			});
			expect(spyon2).toBeCalledWith(
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
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementationOnce(async params => {
					throw 'err';
				});

			expect.assertions(1);
			try {
				await storage.remove('key', {});
			} catch (e) {
				expect(e).toBe('err');
			}
		});

		test('remove object with private', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({
						identityId: 'id',
					});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3Client.prototype, 'send');

			expect.assertions(2);
			expect(await storage.remove('key', { level: 'private' })).toBe('data');
			expect(spyon.mock.calls[0][0].input).toEqual({
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

			const storage = new StorageProvider();
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
		test('list object successfully', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3Client.prototype, 'send');

			expect.assertions(2);
			expect(await storage.list('path', { level: 'public' })).toEqual([
				{
					eTag: 'etag',
					key: 'path/itemsKey',
					lastModified: 'lastmodified',
					size: 'size',
				},
			]);
			expect(spyon.mock.calls[0][0].input).toEqual({
				Bucket: 'bucket',
				Prefix: 'public/path',
			});
			spyon.mockClear();
		});

		test('list objects with zero results', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3Client.prototype, 'send');

			expect.assertions(2);
			expect(
				await storage.list('emptyListResultsPath', { level: 'public' })
			).toEqual([]);
			expect(spyon.mock.calls[0][0].input).toEqual({
				Bucket: 'bucket',
				Prefix: 'public/emptyListResultsPath',
			});
			spyon.mockClear();
		});

		test('list object with track', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3Client.prototype, 'send');
			const spyon2 = jest.spyOn(Hub, 'dispatch');

			expect.assertions(3);
			expect(
				await storage.list('path', { level: 'public', track: true })
			).toEqual([
				{
					eTag: 'etag',
					key: 'path/itemsKey',
					lastModified: 'lastmodified',
					size: 'size',
				},
			]);
			expect(spyon.mock.calls[0][0].input).toEqual({
				Bucket: 'bucket',
				Prefix: 'public/path',
			});
			expect(spyon2).toBeCalledWith(
				'storage',
				{
					event: 'list',
					data: {
						attrs: { method: 'list', result: 'success' },
					},
					message: '1 items returned from list operation',
				},
				'Storage',
				Symbol.for('amplify_default')
			);
		});

		test('list object with maxKeys', async () => {
			const curCredSpyOn = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res({});
					});
				});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest.spyOn(S3Client.prototype, 'send');
			expect.assertions(2);
			expect(
				await storage.list('path', { level: 'public', maxKeys: 1 })
			).toEqual([
				{
					eTag: 'etag',
					key: 'path/itemsKey',
					lastModified: 'lastmodified',
					size: 'size',
				},
			]);
			expect(spyon.mock.calls[0][0].input).toEqual({
				Bucket: 'bucket',
				Prefix: 'public/path',
				MaxKeys: 1,
			});

			spyon.mockClear();
			curCredSpyOn.mockClear();
		});

		test('list object failed', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					res({});
				});
			});

			const storage = new StorageProvider();
			storage.configure(options);
			const spyon = jest
				.spyOn(S3Client.prototype, 'send')
				.mockImplementationOnce(async params => {
					throw 'err';
				});

			expect.assertions(1);
			try {
				await storage.list('path', {});
			} catch (e) {
				expect(e).toBe('err');
			}
		});

		test('credentials not ok', async () => {
			jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
				return new Promise((res, rej) => {
					rej('err');
				});
			});

			const storage = new StorageProvider();
			storage.configure(options_no_cred);

			expect.assertions(1);
			try {
				await storage.list('path', {});
			} catch (e) {
				expect(e).not.toBeNull();
			}
		});
	});
});
