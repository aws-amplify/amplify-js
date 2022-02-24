// These tests should be replaced once SyncEngine.partialDataFeatureFlagEnabled is removed.

import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { defaultAuthStrategy } from '../src/authModeStrategies';

const sessionStorageMock = (() => {
	let store = {};

	return {
		getItem(key) {
			return store[key] || null;
		},
		setItem(key, value) {
			store[key] = value.toString();
		},
		removeItem(key) {
			delete store[key];
		},
		clear() {
			store = {};
		},
	};
})();

Object.defineProperty(window, 'sessionStorage', {
	value: sessionStorageMock,
});

describe('Sync', () => {
	describe('jitteredRetry', () => {
		const defaultQuery = `query {
			syncPosts {
				items {
					id
					title
					count
					_version
					_lastChangedAt
					_deleted
				}
				nextToken
				startedAt
			}
		}`;
		const defaultVariables = {};
		const defaultOpName = 'syncPosts';
		const defaultModelDefinition = { name: 'Post' };
		const defaultAuthMode = GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS;

		beforeEach(() => {
			window.sessionStorage.clear();
			jest.resetModules();
			jest.resetAllMocks();
		});

		it('should return all data', async () => {
			window.sessionStorage.setItem('datastorePartialData', 'true');
			const resolveResponse = {
				data: {
					syncPosts: {
						items: [
							{
								id: '1',
								title: 'Item 1',
							},
							{
								id: '2',
								title: 'Item 2',
							},
						],
					},
				},
			};

			const SyncProcessor = jitteredRetrySyncProcessorSetup({
				resolveResponse,
			});

			const data = await SyncProcessor.jitteredRetry({
				query: defaultQuery,
				variables: defaultVariables,
				opName: defaultOpName,
				modelDefinition: defaultModelDefinition,
			});

			expect(data).toMatchSnapshot();
		});

		it('custom pk: should return all data', async () => {
			window.sessionStorage.setItem('datastorePartialData', 'true');
			const resolveResponse = {
				data: {
					syncPosts: {
						items: [
							{
								postId: '1',
								title: 'Item 1',
							},
							{
								postId: '2',
								title: 'Item 2',
							},
						],
					},
				},
			};

			const SyncProcessor = jitteredRetrySyncProcessorSetup({
				resolveResponse,
			});

			const data = await SyncProcessor.jitteredRetry({
				query: defaultQuery,
				variables: defaultVariables,
				opName: defaultOpName,
				modelDefinition: defaultModelDefinition,
			});

			expect(data).toMatchSnapshot();
		});

		it('should return partial data and send Hub event when datastorePartialData is set', async () => {
			window.sessionStorage.setItem('datastorePartialData', 'true');
			const rejectResponse = {
				data: {
					syncPosts: {
						items: [
							{
								id: '1',
								title: 'Item 1',
							},
							null,
							{
								id: '3',
								title: 'Item 3',
							},
						],
					},
				},
				errors: [
					{
						message: 'Item 2 error',
					},
				],
			};

			const hubDispatchMock = jest.fn();
			const coreMocks = {
				Hub: {
					dispatch: hubDispatchMock,
					listen: jest.fn(),
				},
			};

			const SyncProcessor = jitteredRetrySyncProcessorSetup({
				rejectResponse,
				coreMocks,
			});

			const data = await SyncProcessor.jitteredRetry({
				query: defaultQuery,
				variables: defaultVariables,
				opName: defaultOpName,
				modelDefinition: defaultModelDefinition,
				authMode: defaultAuthMode,
			});

			expect(data).toMatchSnapshot();

			expect(hubDispatchMock).toHaveBeenCalledWith('datastore', {
				event: 'syncQueriesPartialSyncError',
				data: {
					errors: [
						{
							message: 'Item 2 error',
						},
					],
					modelName: 'Post',
				},
			});
		});

		it('should throw error and NOT return data or send Hub event when datastorePartialData is not set', async () => {
			const rejectResponse = {
				data: {
					syncPosts: {
						items: [
							{
								id: '1',
								title: 'Item 1',
							},
							null,
							{
								id: '3',
								title: 'Item 3',
							},
						],
					},
				},
				errors: [
					{
						message: 'Item 2 error',
					},
				],
			};

			const hubDispatchMock = jest.fn();
			const coreMocks = {
				Hub: {
					dispatch: hubDispatchMock,
					listen: jest.fn(),
				},
			};

			const SyncProcessor = jitteredRetrySyncProcessorSetup({
				rejectResponse,
				coreMocks,
			});

			try {
				await SyncProcessor.jitteredRetry({
					query: defaultQuery,
					variables: defaultVariables,
					opName: defaultOpName,
					modelDefinition: defaultModelDefinition,
					authMode: defaultAuthMode,
				});
			} catch (e) {
				expect(e).toMatchSnapshot();
			}
		});

		it('should throw error if no data is returned', async () => {
			window.sessionStorage.setItem('datastorePartialData', 'true');
			const rejectResponse = {
				data: null,
				errors: [
					{
						message: 'General error',
					},
				],
			};

			const SyncProcessor = jitteredRetrySyncProcessorSetup({
				rejectResponse,
			});

			try {
				await SyncProcessor.jitteredRetry({
					query: defaultQuery,
					variables: defaultVariables,
					opName: defaultOpName,
					modelDefinition: defaultModelDefinition,
					authMode: defaultAuthMode,
				});
			} catch (e) {
				expect(e).toMatchSnapshot();
			}
		});

		it('should return NonRetryableError for 403 error', async () => {
			const rejectResponse = {
				data: null,
				errors: [
					{
						message: 'Request failed with status code 403',
					},
				],
			};

			const SyncProcessor = jitteredRetrySyncProcessorSetup({
				rejectResponse,
			});

			try {
				await SyncProcessor.jitteredRetry({
					query: defaultQuery,
					variables: defaultVariables,
					opName: defaultOpName,
					modelDefinition: defaultModelDefinition,
					authMode: defaultAuthMode,
				});
			} catch (e) {
				// NonRetryableError has a `nonRetryable` property
				expect(e).toHaveProperty('nonRetryable');
			}
		});

		[
			'No api-key configured',
			'No current user',
			'No credentials',
			'No federated jwt',
		].forEach(authError => {
			it(`should return NonRetryableError for client-side error: ${authError}`, async () => {
				const rejectResponse = {
					message: authError,
				};

				const SyncProcessor = jitteredRetrySyncProcessorSetup({
					rejectResponse,
				});

				try {
					await SyncProcessor.jitteredRetry({
						query: defaultQuery,
						variables: defaultVariables,
						opName: defaultOpName,
						modelDefinition: defaultModelDefinition,
						authMode: defaultAuthMode,
					});
				} catch (e) {
					// NonRetryableError has a `nonRetryable` property
					expect(e).toHaveProperty('nonRetryable');
				}
			});
		});
	});
});

function jitteredRetrySyncProcessorSetup({
	rejectResponse,
	resolveResponse,
	coreMocks,
}: {
	rejectResponse?: any;
	resolveResponse?: any;
	coreMocks?: object;
}) {
	jest.mock('@aws-amplify/api', () => ({
		...jest.requireActual('@aws-amplify/api'),
		graphql: () =>
			new Promise((res, rej) => {
				if (resolveResponse) {
					res(resolveResponse);
				} else if (rejectResponse) {
					rej(rejectResponse);
				}
			}),
	}));

	jest.mock('@aws-amplify/core', () => ({
		...jest.requireActual('@aws-amplify/core'),
		// No need to retry any thrown errors right now,
		// so we're overriding jitteredExponentialRetry
		jitteredExponentialRetry: (fn, args) => fn(...args),
		...coreMocks,
	}));

	const SyncProcessorClass =
		require('../src/sync/processors/sync').SyncProcessor;

	const testInternalSchema = {
		namespaces: {},
		version: '',
	};

	const SyncProcessor = new SyncProcessorClass(
		testInternalSchema,
		null, // syncPredicates
		{ aws_appsync_authenticationType: 'userPools' },
		defaultAuthStrategy
	);

	return SyncProcessor;
}
