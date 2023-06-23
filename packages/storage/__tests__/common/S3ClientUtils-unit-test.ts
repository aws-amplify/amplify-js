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
import { S3ClientConfig } from '@aws-sdk/client-s3';

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
		expect.assertions(4);
		const mockCredentials: ICredentials = {
			accessKeyId: 'accessKeyId',
			sessionToken: 'sessionToken',
			secretAccessKey: 'secretAccessKey',
			identityId: 'identityId',
			authenticated: true,
		};
		const s3Config = loadS3Config({
			region: 'us-west-2',
			useAccelerateEndpoint: true,
			storageAction: StorageAction.Get,
			credentials: mockCredentials,
		});
		expect(s3Config.userAgentValue).toEqual(
			getAmplifyUserAgent({
				category: Category.Storage,
				action: StorageAction.Get,
			})
		);
		expect(s3Config.region).toEqual('us-west-2');
		expect(s3Config.useAccelerateEndpoint).toBe(true);
		expect(await s3Config.credentials()).toBe(mockCredentials);
	});

	test('createS3Client injects credentials provider', async () => {
		expect.assertions(4);
		const mockCredentials: ICredentials = {
			accessKeyId: 'accessKeyId',
			sessionToken: 'sessionToken',
			secretAccessKey: 'secretAccessKey',
			identityId: 'identityId',
			authenticated: true,
		};
		jest
			.spyOn(Credentials, 'get')
			.mockImplementationOnce(() => Promise.resolve(mockCredentials));
		const s3Config = loadS3Config({
			region: 'us-west-2',
			useAccelerateEndpoint: true,
			storageAction: StorageAction.Get,
		});
		expect(s3Config.userAgentValue).toEqual(
			getAmplifyUserAgent({
				category: Category.Storage,
				action: StorageAction.Get,
			})
		);
		expect(s3Config.region).toEqual('us-west-2');
		expect(s3Config.useAccelerateEndpoint).toBe(true);
		expect(await s3Config.credentials()).toEqual(mockCredentials);
	});

	test('credentialsProvider test', async () => {
		const mockCredentials: ICredentials = {
			accessKeyId: 'accessKeyId',
			sessionToken: 'sessionToken',
			secretAccessKey: 'secretAccessKey',
			identityId: 'identityId',
			authenticated: true,
		};
		jest
			.spyOn(Credentials, 'get')
			.mockImplementationOnce(() => Promise.resolve(mockCredentials));
		const credentials = await credentialsProvider();
		expect(credentials).toStrictEqual(mockCredentials);
	});

	test('credentialsProvider - Credentials.get error', async () => {
		jest
			.spyOn(Credentials, 'get')
			.mockImplementationOnce(() => Promise.reject('err'));
		const credentials = await credentialsProvider();
		expect(credentials).toStrictEqual({ accessKeyId: '', secretAccessKey: '' });
	});
});
