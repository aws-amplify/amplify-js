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

		const authModes: GraphQLAuthMode[] = [
			'apiKey',
			'userPool',
			'oidc',
			'iam',
			'lambda',
			'none',
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

				for (const authMode of authModes) {
					test(`auth override: ${authMode}`, async () => {
						await events.connect('/', { authMode });

						expect(mockProvider.connect).toHaveBeenCalledWith(
							expect.objectContaining({ authenticationType: authMode }),
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

				for (const authMode of authModes) {
					test(`auth override: ${authMode}`, async () => {
						const channel = await events.connect('/');

						channel.subscribe(
							{
								next: data => void data,
								error: error => void error,
							},
							{ authMode },
						);

						expect(mockSubscribeObservable).toHaveBeenCalledWith(
							expect.objectContaining({ authenticationType: authMode }),
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

				for (const authMode of authModes) {
					test(`auth override: ${authMode}`, async () => {
						const channel = await events.connect('/');

						channel.publish({ some: 'data' }, { authMode });

						expect(mockProvider.publish).toHaveBeenCalledWith(
							expect.objectContaining({ authenticationType: authMode }),
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

			for (const authMode of authModes) {
				test(`auth override: ${authMode}`, async () => {
					await events.post('/', { test: 'data' }, { authMode });

					expect(mockReq).toHaveBeenCalledWith(
						Amplify,
						expect.objectContaining({
							query: '/',
							variables: ['{"test":"data"}'],
							authenticationType: authMode,
						}),
						{},
						abortController,
					);
				});
			}
		});
	});
});
