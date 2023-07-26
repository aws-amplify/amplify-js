// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials, ICredentials, StorageAction } from '@aws-amplify/core';
import * as utils from '../../src/common/S3ClientUtils';
import { AWSS3Provider as StorageProvider } from '../../src/providers/AWSS3Provider';
import { StorageOptions } from '../../src';
import { headObject, getObject } from '../../src/AwsClients/S3';
import { presignUrl } from '@aws-amplify/core/internals/aws-client-utils';
import { InternalStorageClass } from '../../src/internals/InternalStorage';
import { getStorageUserAgentValue } from '../../src/common/StorageUtils';

jest.mock('../../src/AwsClients/S3');
jest.mock('@aws-amplify/core/internals/aws-client-utils');

const mockHeadObject = headObject as jest.Mock;
const mockGetObject = getObject as jest.Mock;
const mockPresignUrl = presignUrl as jest.Mock;

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

let provider: StorageProvider;
let storage: InternalStorageClass;

const originalLoadS3Config = utils.loadS3Config;
// @ts-ignore
utils.loadS3Config = jest.fn(originalLoadS3Config);
mockPresignUrl.mockResolvedValue('presignedUrl');

describe('Each Storage call should create a client with the right StorageAction', () => {
	beforeEach(() => {
		jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
			return Promise.resolve(credentials);
		});

		provider = new StorageProvider();
		provider.configure(options);

		storage = new InternalStorageClass();
		storage.configure();

		storage.addPluggable(provider);

		mockHeadObject.mockResolvedValue({
			ContentLength: '100',
			ContentType: 'text/plain',
			Etag: 'etag',
			LastModified: 'lastmodified',
			Metadata: { key: 'value' },
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
	});

	test('getUrl', async () => {
		provider.get = jest.fn(provider.get);

		await storage.get('test');
		expect(provider.get).toBeCalledWith(
			'test',
			expect.anything(),
			getStorageUserAgentValue(StorageAction.Get)
		);
	});

	test('getProperties', async () => {
		provider.getProperties = jest.fn(provider.getProperties);

		await storage.getProperties('test');
		expect(provider.getProperties).toBeCalledWith(
			'test',
			undefined,
			getStorageUserAgentValue(StorageAction.GetProperties)
		);
	});

	test('download', async () => {
		mockGetObject.mockResolvedValue({
			Body: {
				size: '',
				length: '',
			},
		});

		provider.get = jest.fn(provider.get);

		await storage.get('test', { download: true });
		expect(provider.get).toBeCalledWith(
			'test',
			expect.anything(),
			getStorageUserAgentValue(StorageAction.Get)
		);
	});

	test('uploadData', async () => {
		provider.put = jest.fn(provider.put);

		await storage.put('test', 'testData');
		expect(provider.put).toBeCalledWith(
			'test',
			'testData',
			expect.anything(),
			getStorageUserAgentValue(StorageAction.Put)
		);
	});

	test('copy', async () => {
		provider.copy = jest.fn(provider.copy);

		await storage.copy({ key: 'testSrc' }, { key: 'testDest' });
		expect(provider.copy).toBeCalledWith(
			{ key: 'testSrc' },
			{ key: 'testDest' },
			expect.anything(),
			getStorageUserAgentValue(StorageAction.Copy)
		);
	});

	test('list', async () => {
		provider.list = jest.fn(provider.list);

		await storage.list('');
		expect(provider.list).toBeCalledWith(
			'',
			undefined,
			getStorageUserAgentValue(StorageAction.List)
		);
	});

	test('remove', async () => {
		provider.remove = jest.fn(provider.remove);

		await storage.remove('test');
		expect(provider.remove).toBeCalledWith(
			'test',
			undefined,
			getStorageUserAgentValue(StorageAction.Remove)
		);
	});
});
