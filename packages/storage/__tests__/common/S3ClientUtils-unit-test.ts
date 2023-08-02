// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	getPrefix,
	loadS3Config,
	credentialsProvider,
} from '../../src/common/S3ClientUtils';
import {
	ICredentials,
	Credentials,
	getAmplifyUserAgent,
	StorageAction,
	Category,
} from '@aws-amplify/core';

const credentials: ICredentials = {
	accessKeyId: 'accessKeyId',
	secretAccessKey: 'secretAccessKey',
	sessionToken: '',
	identityId: 'identityId',
	authenticated: true,
};

describe('S3ClientUtils tests', () => {
	test('basic getPrefix tests', () => {
		const publicPrefix = getPrefix({
			level: 'public',
			credentials,
		});
		expect(publicPrefix).toEqual('public/');

		const protectedPrefix = getPrefix({
			level: 'protected',
			credentials,
		});
		expect(protectedPrefix).toEqual('protected/identityId/');
		const privatePrefix = getPrefix({
			level: 'private',
			credentials,
		});
		expect(privatePrefix).toEqual('private/identityId/');
	});

	test('getPrefix with customPrefix', () => {
		const customPrefix = {
			public: 'myPublic/',
			protected: 'myProtected/',
			private: 'myPrivate/',
		};
		const publicPrefix = getPrefix({
			level: 'public',
			credentials,
			customPrefix,
		});
		expect(publicPrefix).toEqual('myPublic/');
		const protectedPrefix = getPrefix({
			level: 'protected',
			credentials,
			customPrefix,
		});
		expect(protectedPrefix).toEqual('myProtected/identityId/');
		const privatePrefix = getPrefix({
			level: 'private',
			credentials,
			customPrefix,
		});
		expect(privatePrefix).toEqual('myPrivate/identityId/');
	});

	test('createS3Client test', async () => {
		expect.assertions(3);
		const s3Config = loadS3Config({
			region: 'us-west-2',
			useAccelerateEndpoint: true,
			credentials,
		});
		expect(s3Config.region).toEqual('us-west-2');
		expect(s3Config.useAccelerateEndpoint).toBe(true);
		expect(await s3Config.credentials()).toBe(credentials);
	});

	test('createS3Client injects credentials provider', async () => {
		expect.assertions(3);
		jest
			.spyOn(Credentials, 'get')
			.mockImplementationOnce(() => Promise.resolve(credentials));
		const s3Config = loadS3Config({
			region: 'us-west-2',
			useAccelerateEndpoint: true,
		});
		expect(s3Config.region).toEqual('us-west-2');
		expect(s3Config.useAccelerateEndpoint).toBe(true);
		expect(await s3Config.credentials()).toEqual(credentials);
	});

	test('createS3Client test - dangerouslyConnectToHttpEndpointForTesting', async () => {
		const s3Config = loadS3Config({
			region: 'us-west-2',
			dangerouslyConnectToHttpEndpointForTesting: true,
		});
		expect(s3Config).toMatchObject({
			customEndpoint: 'http://localhost:20005',
			forcePathStyle: true,
		});
	});

	test('credentialsProvider test', async () => {
		jest
			.spyOn(Credentials, 'get')
			.mockImplementationOnce(() => Promise.resolve(credentials));
		const credentials = await credentialsProvider();
		expect(credentials).toStrictEqual(credentials);
	});

	test('credentialsProvider - Credentials.get error', async () => {
		jest
			.spyOn(Credentials, 'get')
			.mockImplementationOnce(() => Promise.reject('err'));
		const credentials = await credentialsProvider();
		expect(credentials).toStrictEqual({ accessKeyId: '', secretAccessKey: '' });
	});
});
