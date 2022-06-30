import {
	getPrefix,
	createPrefixMiddleware,
	autoAdjustClockskewMiddleware,
	createS3Client,
	credentialsProvider,
} from '../../src/common/S3ClientUtils';
import {
	ICredentials,
	Credentials,
	getAmplifyUserAgent,
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

	test('createPrefixMiddleware test', async () => {
		jest.spyOn(Credentials, 'get').mockImplementation(() => {
			return Promise.resolve(credentials);
		});
		const publicPrefixMiddleware = createPrefixMiddleware(
			{
				credentials,
				level: 'public',
			},
			'key'
		);
		const protectedPrefixMiddleware = createPrefixMiddleware(
			{
				credentials,
				level: 'protected',
			},
			'key'
		);
		const privatePrefixMiddleware = createPrefixMiddleware(
			{
				credentials,
				level: 'private',
			},
			'key'
		);
		const { output: publicPrefix } = await publicPrefixMiddleware(
			arg =>
				Promise.resolve({
					output: arg.input.Key,
					response: null,
				}),
			null
		)({ input: { Key: 'key' } });
		const { output: protectedPrefix } = await protectedPrefixMiddleware(
			arg =>
				Promise.resolve({
					output: arg.input.Key,
					response: null,
				}),
			null
		)({ input: { Key: 'key' } });
		const { output: privatePrefix } = await privatePrefixMiddleware(
			arg =>
				Promise.resolve({
					output: arg.input.Key,
					response: null,
				}),
			null
		)({ input: { Key: 'key' } });
		expect(publicPrefix).toEqual('public/key');
		expect(protectedPrefix).toEqual('protected/identityId/key');
		expect(privatePrefix).toEqual('private/identityId/key');
	});

	test('createS3Client test', async () => {
		const s3client = createS3Client({
			region: 'us-west-2',
			useAccelerateEndpoint: true,
		});
		// ensure customUserAgent is set properly
		expect(s3client.config.customUserAgent).toEqual([[getAmplifyUserAgent()]]);
		expect(await s3client.config.region()).toEqual('us-west-2');
		expect(s3client.config.useAccelerateEndpoint).toBe(true);
	});

	test('createS3Client test - dangerouslyConnectToHttpEndpointForTesting', async () => {
		const s3client = createS3Client({
			region: 'us-west-2',
			dangerouslyConnectToHttpEndpointForTesting: true,
		});
		expect(await s3client.config.endpoint()).toStrictEqual({
			hostname: 'localhost',
			path: '/',
			port: 20005,
			protocol: 'http:',
			query: undefined,
		});
		expect(s3client.config.tls).toBe(false);
		expect(s3client.config.bucketEndpoint).toBe(false);
		expect(s3client.config.forcePathStyle).toBe(true);
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

	test('autoAdjustClockskewMiddleware tests', async () => {
		const dateNow = Date.now();
		// keep the Date.now() call inside the middleware consistent
		jest.spyOn(Date, 'now').mockImplementation(() => dateNow);
		const s3ClientConfig = { systemClockOffset: 0 } as S3ClientConfig;
		const middleware = autoAdjustClockskewMiddleware(s3ClientConfig);
		const oneHourInMs = 1000 * 60 * 60;
		try {
			await middleware(
				arg =>
					Promise.reject({
						ServerTime: new Date(dateNow + oneHourInMs),
						Code: 'RequestTimeTooSkewed',
					}),
				null
			)({ request: null, input: {} });
		} catch (err) {
			expect(s3ClientConfig.systemClockOffset).toBe(oneHourInMs);
		}
	});
});
