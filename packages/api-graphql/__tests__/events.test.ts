import { configure } from 'aws-amplify';
import { createMockAmplifyContext, MockAmplifyContext } from './testUtils/mockAmplifyContext';

import { events } from '../src/';
import { appsyncRequest } from '../src/internals/events/appsyncRequest';

import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';

const abortController = new AbortController();

var mockSubscribeObservable: any;

const mockProvider = {
	connect: jest.fn(),
	subscribe: jest.fn(() => ({
		subscribe: jest.fn(),
	})),
	publish: jest.fn(),
	close: jest.fn(),
	closeIfNoActiveSubscription: jest.fn(),
};

jest.mock('../src/Providers/AWSAppSyncEventsProvider', () => ({
	createAppSyncEventProvider: jest.fn(() => mockProvider),
}));

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
	afterEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		jest.resetAllMocks();
	});

	describe('config', () => {
		test('no configure()', async () => {
			const emptyCtx = createMockAmplifyContext();
			await expect(events.connect(emptyCtx, '/')).rejects.toThrow(
				'Amplify configuration is missing. Have you called Amplify.configure()?',
			);
		});

		test('manual (resource config)', async () => {
			const ctx = createMockAmplifyContext({
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

			await expect(events.connect(ctx, '/')).resolves.not.toThrow();
		});

		test('outputs (amplify-backend config)', async () => {
			const ctx = configure({
				custom: {
					events: {
						url: 'https://not-a-real.ddpg-api.us-west-2.amazonaws.com/event',
						aws_region: 'us-west-2',
						default_authorization_type: 'API_KEY',
						api_key: 'da2-abcxyz321',
					},
				},
				version: '1.2',
			} as any);

			await expect(events.connect(ctx, '/')).resolves.not.toThrow();
		});
	});

	describe('client', () => {
		let mockCtx: MockAmplifyContext;

		beforeEach(() => {
			mockCtx = createMockAmplifyContext({
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

						expect(mockProvider.connect).toHaveBeenCalledWith(
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

						expect(mockProvider.subscribe).toHaveBeenCalledWith(
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

						expect(mockProvider.publish).toHaveBeenCalledWith(
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
