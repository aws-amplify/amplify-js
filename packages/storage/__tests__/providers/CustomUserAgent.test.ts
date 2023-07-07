// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials, ICredentials, StorageAction } from '@aws-amplify/core';
import * as utils from '../../src/common/S3ClientUtils';
import { AWSS3Provider as StorageProvider } from '../../src/providers/AWSS3Provider';
import { StorageOptions } from '../../src';
import { headObject, getObject } from '../../src/AwsClients/S3';
import { presignUrl } from '@aws-amplify/core/internals/aws-client-utils';

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

let storage: StorageProvider;

const originalLoadS3Config = utils.loadS3Config;
// @ts-ignore
utils.loadS3Config = jest.fn(originalLoadS3Config);
mockPresignUrl.mockResolvedValue('presignedUrl');

describe('Each Storage call should create a client with the right StorageAction', () => {
	beforeEach(() => {
		jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
			return Promise.resolve(credentials);
		});
		storage = new StorageProvider();
		storage.configure(options);
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
	});

	test('getUrl', async () => {
		await storage.get('test');
		expect(utils.loadS3Config).toBeCalledWith(
			expect.objectContaining({
				storageAction: StorageAction.Get,
			})
		);
	});

	test('getProperties', async () => {
		await storage.getProperties('test');
		expect(utils.loadS3Config).toBeCalledWith(
			expect.objectContaining({
				storageAction: StorageAction.GetProperties,
			})
		);
	});

	test('download', async () => {
		mockGetObject.mockResolvedValue({
			Body: {
				size: '',
				length: '',
			},
		});

		await storage.get('test', { download: true });
		expect(utils.loadS3Config).toBeCalledWith(
			expect.objectContaining({
				storageAction: StorageAction.Get,
			})
		);
	});

	test('uploadData', async () => {
		await storage.put('test', 'testData');
		expect(utils.loadS3Config).toBeCalledWith(
			expect.objectContaining({
				storageAction: StorageAction.Put,
			})
		);
	});

	test('copy', async () => {
		await storage.copy({ key: 'testSrc' }, { key: 'testDest' });
		expect(utils.loadS3Config).toBeCalledWith(
			expect.objectContaining({
				storageAction: StorageAction.Copy,
			})
		);
	});

	test('list', async () => {
		await storage.list('');
		expect(utils.loadS3Config).toBeCalledWith(
			expect.objectContaining({
				storageAction: StorageAction.List,
			})
		);
	});

	test('remove', async () => {
		await storage.remove('test');
		expect(utils.loadS3Config).toBeCalledWith(
			expect.objectContaining({
				storageAction: StorageAction.Remove,
			})
		);
	});
});
