// These tests should be replaced once SyncEngine.partialDataFeatureFlagEnabled is removed.
import {
	AmplifyError,
	Category,
	DataStoreAction,
} from '@aws-amplify/core/internals/utils';
import { defaultAuthStrategy } from '../src/authModeStrategies';
let mockGraphQl;

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
const defaultAuthMode = 'userPool';

describe('Sync', () => {
	describe('jitteredRetry', () => {
		beforeEach(() => {
			window.sessionStorage.clear();
			jest.resetModules();
			jest.resetAllMocks();
		});

		it('should return all data', async () => {
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

		it('should return partial data and send Hub event', async () => {
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
				event: 'nonApplicableDataReceived',
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

		// TODO(v6) Re-enable test
		it('should throw error if no data is returned', async () => {
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
						originalError: {
							$metadata: {
								httpStatusCode: 403,
							},
						},
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

		it('should send datastore user agent details with graphql request', async () => {
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

			await SyncProcessor.jitteredRetry({
				query: defaultQuery,
				variables: defaultVariables,
				opName: defaultOpName,
				modelDefinition: defaultModelDefinition,
			});

			expect(mockGraphQl).toHaveBeenCalledWith(expect.anything(), undefined, {
				category: Category.DataStore,
				action: DataStoreAction.GraphQl,
			});
		});
	});

	describe('error handler', () => {
		const errorHandler = jest.fn();
		const data = {
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
		};

		beforeEach(async () => {
			window.sessionStorage.clear();
			jest.resetModules();
			jest.resetAllMocks();
			errorHandler.mockClear();
		});

		test('bad record', async () => {
			const syncProcessor = jitteredRetrySyncProcessorSetup({
				errorHandler,
				rejectResponse: {
					data,
					errors: [
						{
							message: 'Cannot return boolean for string type',
						},
					],
				},
			});

			await syncProcessor.jitteredRetry({
				query: defaultQuery,
				variables: defaultVariables,
				opName: defaultOpName,
				modelDefinition: defaultModelDefinition,
			});

			expect(errorHandler).toHaveBeenCalledWith(
				expect.objectContaining({
					operation: 'syncPosts',
					process: 'sync',
					errorType: 'BadRecord',
				}),
			);
		});

		test('connection timeout', async () => {
			const syncProcessor = jitteredRetrySyncProcessorSetup({
				errorHandler,
				rejectResponse: {
					data,
					errors: [
						{
							message: 'Connection failed: Connection Timeout',
						},
					],
				},
			});

			await syncProcessor.jitteredRetry({
				query: defaultQuery,
				variables: defaultVariables,
				opName: defaultOpName,
				modelDefinition: defaultModelDefinition,
			});

			expect(errorHandler).toHaveBeenCalledWith(
				expect.objectContaining({
					operation: 'syncPosts',
					process: 'sync',
					errorType: 'Transient',
				}),
			);
		});

		test('server error', async () => {
			const syncProcessor = jitteredRetrySyncProcessorSetup({
				errorHandler,
				rejectResponse: {
					data,
					errors: [
						{
							originalError: {
								$metadata: {
									httpStatusCode: 500,
								},
							},
						},
					],
				},
			});

			await syncProcessor.jitteredRetry({
				query: defaultQuery,
				variables: defaultVariables,
				opName: defaultOpName,
				modelDefinition: defaultModelDefinition,
			});

			expect(errorHandler).toHaveBeenCalledWith(
				expect.objectContaining({
					operation: 'syncPosts',
					process: 'sync',
					errorType: 'Transient',
				}),
			);
		});
	});
});

function jitteredRetrySyncProcessorSetup({
	rejectResponse,
	resolveResponse,
	coreMocks,
	errorHandler = () => null,
}: {
	rejectResponse?: any;
	resolveResponse?: any;
	coreMocks?: object;
	errorHandler?: () => null;
}) {
	mockGraphQl = jest.fn(
		() =>
			new Promise((res, rej) => {
				if (resolveResponse) {
					res(resolveResponse);
				} else if (rejectResponse) {
					rej(rejectResponse);
				}
			}),
	);
	// mock graphql to return a mockable observable
	jest.mock('@aws-amplify/api/internals', () => {
		const actualInternalAPIModule = jest.requireActual(
			'@aws-amplify/api/internals',
		);
		const actualInternalAPIInstance = actualInternalAPIModule.InternalAPI;

		return {
			...actualInternalAPIModule,
			InternalAPI: {
				...actualInternalAPIInstance,
				graphql: mockGraphQl,
			},
		};
	});

	jest.mock('@aws-amplify/core/internals/utils', () => ({
		...jest.requireActual('@aws-amplify/core/internals/utils'),
		// No need to retry any thrown errors right now,
		// so we're overriding jitteredExponentialRetry
		jitteredExponentialRetry: (fn, args) => fn(...args),
	}));

	jest.mock('@aws-amplify/core', () => ({
		...jest.requireActual('@aws-amplify/core'),
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
		defaultAuthStrategy,
		errorHandler,
		{},
	);

	return SyncProcessor;
}
