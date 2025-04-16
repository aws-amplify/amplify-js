import { Amplify } from '@aws-amplify/core';
import { AppSyncEventProvider } from '../src/Providers/AWSAppSyncEventsProvider';

import { events } from '../src/';
import { appsyncRequest } from '../src/internals/events/appsyncRequest';

import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';

const abortController = new AbortController();

var mockSubscribeObservable: any;

jest.mock('../src/Providers/AWSAppSyncEventsProvider', () => {
	mockSubscribeObservable = jest.fn(() => ({
		subscribe: jest.fn(),
	}));

	return {
		AppSyncEventProvider: {
			connect: jest.fn(),
			subscribe: jest.fn(mockSubscribeObservable),
			publish: jest.fn(),
			close: jest.fn(),
		},
	};
});

jest.mock('../src/internals/events/appsyncRequest', () => {
	return {
		appsyncRequest: jest.fn().mockResolvedValue({}),
	};
});

/**
 * Note: thorough auth testing, including validating correct auth header generation
 * is performed in __tests__/AWSAppSyncRealTimeProvider.test.ts
 *
 * The auth implementation is shared between AWSAppSyncEventsProvider and AWSAppSyncRealTimeProvider,
 * so we're just sanity checking that the expected auth mode is passed to the provider in this test file.
 */

describe('Events client', () => {
	afterAll(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});

	describe('config', () => {
		test('no configure()', async () => {
			await expect(events.connect('/')).rejects.toThrow(
				'Amplify configuration is missing. Have you called Amplify.configure()?',
			);
		});

		test('manual (resource config)', async () => {
			Amplify.configure({
				API: {
					Events: {
						endpoint:
							'https://not-a-real.ddpg-api.us-west-2.amazonaws.com/event',
						region: 'us-west-2',
						defaultAuthMode: 'apiKey',
						apiKey: 'da2-abcxyz321',
					},
				},
			});

			await expect(events.connect('/')).resolves.not.toThrow();
		});

		test('outputs (amplify-backend config)', async () => {
			Amplify.configure({
				custom: {
					events: {
						url: 'https://not-a-real.ddpg-api.us-west-2.amazonaws.com/event',
						aws_region: 'us-west-2',
						default_authorization_type: 'API_KEY',
						api_key: 'da2-abcxyz321',
					},
				},
				version: '1.2',
			});

			await expect(events.connect('/')).resolves.not.toThrow();
		});
	});

	describe('client', () => {
		beforeEach(() => {
			Amplify.configure({
				API: {
					Events: {
						endpoint:
							'https://not-a-real.ddpg-api.us-west-2.amazonaws.com/event',
						region: 'us-west-2',
						defaultAuthMode: 'apiKey',
						apiKey: 'da2-abcxyz321',
					},
				},
			});
		});

		const authModeConfigs: { authMode: GraphQLAuthMode, apiKey?: string, authToken?: string }[] = [
			{ authMode: 'apiKey', apiKey: 'testAPIKey' },
			{ authMode: 'userPool', authToken: 'userPoolToken' },
			{ authMode: 'oidc', authToken: 'oidcToken' },
			{ authMode: 'iam', authToken: 'iamToken' },
			{ authMode: 'lambda', authToken: 'lambdaToken' },
			{ authMode: 'none' },
		];

		describe('channel', () => {
			test('happy connect', async () => {
				const channel = await events.connect('/');

				expect(channel.subscribe).toBeInstanceOf(Function);
				expect(channel.close).toBeInstanceOf(Function);
			});

			describe('auth modes', () => {
				let mockProvider: typeof AppSyncEventProvider;

				beforeEach(() => {
					mockProvider = AppSyncEventProvider;
				});

				for (const authConfig of authModeConfigs) {
					const {authMode: authenticationType, ...config} = authConfig
					test(`connect auth override: ${authConfig.authMode}`, async () => {
						const channel = await events.connect('/', authConfig);

						expect(mockProvider.connect).toHaveBeenCalledWith(
							expect.objectContaining({
								authenticationType,
								...config
							}),
						);
					});
				}
			});
		});

		describe('subscribe', () => {
			test('happy subscribe', async () => {
				const channel = await events.connect('/');

				channel.subscribe({
					next: data => void data,
					error: error => void error,
				});
			});

			describe('auth modes', () => {
				let mockProvider: typeof AppSyncEventProvider;

				beforeEach(() => {
					mockProvider = AppSyncEventProvider;
				});

				for (const authConfig of authModeConfigs) {
					const {authMode: authenticationType, ...config} = authConfig

					test(`subscription auth override: ${authConfig.authMode}`, async () => {
						const channel = await events.connect('/');
						channel.subscribe( 
							{
								next: data => void data,
								error: error => void error,
							},
							authConfig
						)

						expect(mockProvider.subscribe).toHaveBeenCalledWith(
							expect.objectContaining({
								authenticationType,
								...config
							}),
						);
					});
				}
			});
		});

		describe('publish', () => {
			test('happy publish', async () => {
				const channel = await events.connect('/');

				channel.publish({ some: 'data' });
			});

			test('publish() becomes invalid after .close() is called', async () => {
				const channel = await events.connect('/');
				channel.close();
				await expect(channel.publish({ some: 'data' })).rejects.toThrow(
					'Channel is closed',
				);
			});

			describe('auth modes', () => {
				let mockProvider: typeof AppSyncEventProvider;

				beforeEach(() => {
					mockProvider = AppSyncEventProvider;
				});

				for (const authConfig of authModeConfigs) {
					const {authMode: authenticationType, ...config} = authConfig

					test(`publish auth override: ${authConfig.authMode}`, async () => {
						const channel = await events.connect('/');
						channel.publish( 
							"Test message",
							authConfig
						)

						expect(mockProvider.publish).toHaveBeenCalledWith(
							expect.objectContaining({
								authenticationType,
								...config
							}),
						);
					});
				}
			});
		});

		describe('post', () => {
			let mockReq: typeof appsyncRequest;

			beforeEach(() => {
				mockReq = appsyncRequest;
			});

			test('happy post', async () => {
				await events.post('/', { test: 'data' });

				expect(mockReq).toHaveBeenCalledWith(
					Amplify,
					expect.objectContaining({
						query: '/',
						variables: ['{"test":"data"}'],
					}),
					{},
					abortController,
				);
			});

			for (const authConfig of authModeConfigs) {
				const {authMode: authenticationType, ...config} = authConfig

				test(`auth override: ${authenticationType}`, async () => {
					await events.post('/', { test: 'data' }, authConfig);

					expect(mockReq).toHaveBeenCalledWith(
						Amplify,
						expect.objectContaining({
							query: '/',
							variables: ['{"test":"data"}'],
							authenticationType,
							...config
						}),
						{},
						abortController,
					);
				});
			}
		});
	});
});
