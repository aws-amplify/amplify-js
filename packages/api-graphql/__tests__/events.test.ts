import { AmplifyContext } from '@aws-amplify/core';
import { AWSAppSyncEventProvider } from '../src/Providers/AWSAppSyncEventsProvider';

import { events } from '../src/';
import { appsyncRequest } from '../src/internals/events/appsyncRequest';

import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';

const abortController = new AbortController();

var mockSubscribeObservable: any;

const mockEventProvider = {
	connect: jest.fn(),
	subscribe: jest.fn(() => ({
		subscribe: jest.fn(),
	})),
	publish: jest.fn(),
	close: jest.fn(),
	closeIfNoActiveSubscription: jest.fn(),
};

jest.mock('../src/Providers/AWSAppSyncEventsProvider', () => {
	mockSubscribeObservable = jest.fn(() => ({
		subscribe: jest.fn(),
	}));

	return {
		AWSAppSyncEventProvider: jest.fn(),
		createAppSyncEventProvider: jest.fn(() => mockEventProvider),
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

const mockCtx: AmplifyContext = {
	resourcesConfig: {
		API: {
			Events: {
				endpoint: 'https://not-a-real.ddpg-api.us-west-2.amazonaws.com/event',
				region: 'us-west-2',
				defaultAuthMode: 'apiKey',
				apiKey: 'da2-abcxyz321',
			},
		},
	},
	libraryOptions: {},
	fetchAuthSession: jest.fn().mockResolvedValue({}),
	clearCredentials: jest.fn(),
	getTokens: jest.fn(),
};

const emptyCtx: AmplifyContext = {
	resourcesConfig: {},
	libraryOptions: {},
	fetchAuthSession: jest.fn(),
	clearCredentials: jest.fn(),
	getTokens: jest.fn(),
};

describe('Events client', () => {
	afterAll(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});

	describe('config', () => {
		test('no configure()', async () => {
			await expect(events.connect(emptyCtx, '/')).rejects.toThrow(
				'Amplify configuration is missing. Have you called Amplify.configure()?',
			);
		});

		test('manual (resource config)', async () => {
			await expect(events.connect(mockCtx, '/')).resolves.not.toThrow();
		});

		test('outputs (amplify-backend config)', async () => {
			const outputsCtx: AmplifyContext = {
				...mockCtx,
				resourcesConfig: {
					API: {
						Events: {
							endpoint:
								'https://not-a-real.ddpg-api.us-west-2.amazonaws.com/event',
							region: 'us-west-2',
							defaultAuthMode: 'apiKey',
							apiKey: 'da2-abcxyz321',
						},
					},
				},
			};

			await expect(events.connect(outputsCtx, '/')).resolves.not.toThrow();
		});
	});

	describe('client', () => {
		const authModeConfigs: {
			authMode: GraphQLAuthMode;
			apiKey?: string;
			authToken?: string;
		}[] = [
			{ authMode: 'apiKey', apiKey: 'testAPIKey' },
			{ authMode: 'userPool', authToken: 'userPoolToken' },
			{ authMode: 'oidc', authToken: 'oidcToken' },
			{ authMode: 'iam', authToken: 'iamToken' },
			{ authMode: 'lambda', authToken: 'lambdaToken' },
			{ authMode: 'none' },
		];

		describe('channel', () => {
			test('happy connect', async () => {
				const channel = await events.connect(mockCtx, '/');

				expect(channel.subscribe).toBeInstanceOf(Function);
				expect(channel.close).toBeInstanceOf(Function);
			});

			describe('auth modes', () => {
				for (const authConfig of authModeConfigs) {
					const { authMode: authenticationType, ...config } = authConfig;
					test(`connect auth override: ${authConfig.authMode}`, async () => {
						await events.connect(mockCtx, '/', authConfig);

						expect(mockEventProvider.connect).toHaveBeenCalledWith(
							expect.objectContaining({
								authenticationType,
								...config,
							}),
						);
					});
				}
			});
		});

		describe('subscribe', () => {
			test('happy subscribe', async () => {
				const channel = await events.connect(mockCtx, '/');

				channel.subscribe({
					next: data => void data,
					error: error => void error,
				});
			});

			describe('auth modes', () => {
				for (const authConfig of authModeConfigs) {
					const { authMode: authenticationType, ...config } = authConfig;

					test(`subscription auth override: ${authConfig.authMode}`, async () => {
						const channel = await events.connect(mockCtx, '/');
						channel.subscribe(
							{
								next: data => void data,
								error: error => void error,
							},
							authConfig,
						);

						expect(mockEventProvider.subscribe).toHaveBeenCalledWith(
							expect.objectContaining({
								authenticationType,
								...config,
							}),
						);
					});
				}
			});
		});

		describe('publish', () => {
			test('happy publish', async () => {
				const channel = await events.connect(mockCtx, '/');

				channel.publish({ some: 'data' });
			});

			test('publish() becomes invalid after .close() is called', async () => {
				const channel = await events.connect(mockCtx, '/');
				channel.close();
				await expect(channel.publish({ some: 'data' })).rejects.toThrow(
					'Channel is closed',
				);
			});

			describe('auth modes', () => {
				for (const authConfig of authModeConfigs) {
					const { authMode: authenticationType, ...config } = authConfig;

					test(`publish auth override: ${authConfig.authMode}`, async () => {
						const channel = await events.connect(mockCtx, '/');
						channel.publish('Test message', authConfig);

						expect(mockEventProvider.publish).toHaveBeenCalledWith(
							expect.objectContaining({
								authenticationType,
								...config,
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
				await events.post(mockCtx, '/', { test: 'data' });

				expect(mockReq).toHaveBeenCalledWith(
					mockCtx,
					expect.objectContaining({
						query: '/',
						variables: ['{"test":"data"}'],
					}),
					{},
					abortController,
				);
			});

			for (const authConfig of authModeConfigs) {
				const { authMode: authenticationType, ...config } = authConfig;

				test(`auth override: ${authenticationType}`, async () => {
					await events.post(mockCtx, '/', { test: 'data' }, authConfig);

					expect(mockReq).toHaveBeenCalledWith(
						mockCtx,
						expect.objectContaining({
							query: '/',
							variables: ['{"test":"data"}'],
							authenticationType,
							...config,
						}),
						{},
						abortController,
					);
				});
			}
		});
	});
});
