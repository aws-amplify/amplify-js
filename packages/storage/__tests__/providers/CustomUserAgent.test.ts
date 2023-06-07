import { Credentials, ICredentials, StorageAction } from '@aws-amplify/core';
import * as utils from '../../src/common/S3ClientUtils';
import { AWSS3Provider as StorageProvider } from '../../src/providers/AWSS3Provider';
import { StorageOptions } from '../../src';
import { S3Client } from '@aws-sdk/client-s3';

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

let storage: StorageProvider;

const originalCreateS3Client = utils.createS3Client;
// @ts-ignore
utils.createS3Client = jest.fn(originalCreateS3Client);

describe('Each Storage call should create a client with the right StorageAction', () => {
	beforeEach(() => {
		jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
			return Promise.resolve(credentials);
		});
		storage = new StorageProvider();
		storage.configure(options);
		S3Client.prototype.send = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('getUrl', async () => {
		await storage.get('test');
		expect(utils.createS3Client).toBeCalledWith(
			expect.anything(),
			StorageAction.Get,
			expect.anything()
		);
	});

	test('download', async () => {
		// @ts-ignore
		S3Client.prototype.send = jest.fn(() => ({
			Body: {
				size: '',
				length: '',
			},
		}));

		await storage.get('test', { download: true });
		expect(utils.createS3Client).toBeCalledWith(
			expect.anything(),
			StorageAction.Get,
			expect.anything()
		);
	});

	test('uploadData', async () => {
		await storage.put('test', 'testData');
		expect(utils.createS3Client).toBeCalledWith(
			expect.anything(),
			StorageAction.Put,
			expect.anything()
		);
	});

	test('copy', async () => {
		await storage.copy({ key: 'testSrc' }, { key: 'testDest' });
		expect(utils.createS3Client).toBeCalledWith(
			expect.anything(),
			StorageAction.Copy,
			undefined
		);
	});

	test('list', async () => {
		await storage.list('');
		expect(utils.createS3Client).toBeCalledWith(
			expect.anything(),
			StorageAction.List,
			undefined
		);
	});

	test('remove', async () => {
		await storage.remove('test');
		expect(utils.createS3Client).toBeCalledWith(
			expect.anything(),
			StorageAction.Remove,
			undefined
		);
	});
});
