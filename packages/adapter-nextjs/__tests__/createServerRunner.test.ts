// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { sharedInMemoryStorage } from 'aws-amplify/utils';

import { NextServer } from '../src/types';

const mockAmplifyConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			identityPoolId: '123',
			userPoolId: 'abc',
			userPoolClientId: 'def',
		},
	},
	Storage: {
		S3: {
			bucket: 'bucket',
			region: 'us-east-1',
		},
	},
};
jest.mock(
	'../src/utils/createCookieStorageAdapterFromNextServerContext',
	() => ({
		createCookieStorageAdapterFromNextServerContext: jest.fn(() => ({
			get: jest.fn(),
			set: jest.fn(),
			delete: jest.fn(),
			getAll: jest.fn(),
		})),
	}),
);

jest.mock('../src/utils/createTokenValidator', () => ({
	createTokenValidator: jest.fn(() => ({
		getItem: jest.fn(),
	})),
}));

const mockGetRuntimeOptions = jest.fn(() => ({}));
const mockIsServerSideAuthEnabled = jest.fn(() => false);
const mockGlobalSettingsIsSSLOrigin = jest.fn(() => false);
const mockGlobalSettings: NextServer.GlobalSettings = {
	isServerSideAuthEnabled: mockIsServerSideAuthEnabled,
	enableServerSideAuth: jest.fn(),
	setRuntimeOptions: jest.fn(),
	getRuntimeOptions: mockGetRuntimeOptions,
	isSSLOrigin: mockGlobalSettingsIsSSLOrigin,
	setIsSSLOrigin: jest.fn(),
};

describe('createServerRunner', () => {
	let createServerRunner: NextServer.CreateServerRunner;
	let createRunWithAmplifyServerContextSpy: any;

	const AMPLIFY_APP_ORIGIN = 'https://test.com';
	const originalProcessEnv = { ...process.env };
	const modifiedProcessEnv = {
		...originalProcessEnv,
		AMPLIFY_APP_ORIGIN,
	};

	const mockParseAmplifyConfig = jest.fn(config => config);
	const mockCreateAWSCredentialsAndIdentityIdProvider = jest.fn();
	const mockCreateKeyValueStorageFromCookieStorageAdapter = jest.fn();
	const mockCreateUserPoolsTokenProvider = jest.fn();
	const mockRunWithAmplifyServerContextCore = jest.fn();
	const mockCreateAuthRouteHandlersFactory = jest.fn(() => jest.fn());
	const mockIsSSLOriginUtil = jest.fn(() => true);
	const mockIsValidOrigin = jest.fn(origin => !!origin);

	beforeAll(() => {
		jest.doMock('../src/utils/globalSettings', () => ({
			globalSettings: mockGlobalSettings,
		}));
	});

	beforeEach(() => {
		process.env = modifiedProcessEnv;

		jest.resetModules();
		jest.doMock('aws-amplify/adapter-core', () => ({
			createAWSCredentialsAndIdentityIdProvider:
				mockCreateAWSCredentialsAndIdentityIdProvider,
			createKeyValueStorageFromCookieStorageAdapter:
				mockCreateKeyValueStorageFromCookieStorageAdapter,
			createUserPoolsTokenProvider: mockCreateUserPoolsTokenProvider,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContextCore,
		}));

		jest.doMock('aws-amplify/utils', () => ({
			...jest.requireActual('aws-amplify/utils'),
			parseAmplifyConfig: mockParseAmplifyConfig,
		}));
		createRunWithAmplifyServerContextSpy = jest.spyOn(
			require('../src/utils/createRunWithAmplifyServerContext'),
			'createRunWithAmplifyServerContext',
		);
		jest.doMock('../src/auth', () => ({
			createAuthRouteHandlersFactory: mockCreateAuthRouteHandlersFactory,
		}));

		jest.doMock('../src/auth/utils', () => ({
			isSSLOrigin: mockIsSSLOriginUtil,
			isValidOrigin: mockIsValidOrigin,
		}));

		({ createServerRunner } = require('../src'));

		mockCreateAuthRouteHandlersFactory.mockReturnValue(jest.fn());
	});

	afterEach(() => {
		process.env = originalProcessEnv;

		jest.clearAllMocks();
	});

	it('calls parseAmplifyConfig when the config object is imported from amplify configuration file', () => {
		createServerRunner({ config: { aws_project_region: 'us-west-2' } });
		expect(mockParseAmplifyConfig).toHaveBeenCalled();
	});

	it('returns runWithAmplifyServerContext function', () => {
		const result = createServerRunner({ config: mockAmplifyConfig });
		expect(result).toMatchObject({
			runWithAmplifyServerContext: expect.any(Function),
		});
	});

	it('returns createAuthRoutesHandlers function', () => {
		const result = createServerRunner({ config: mockAmplifyConfig });

		expect(mockCreateAuthRouteHandlersFactory).toHaveBeenCalledWith({
			config: mockAmplifyConfig,
			amplifyAppOrigin: AMPLIFY_APP_ORIGIN,
			runWithAmplifyServerContext: expect.any(Function),
			globalSettings: mockGlobalSettings,
		});
		expect(result).toMatchObject({
			createAuthRouteHandlers: expect.any(Function),
		});
	});

	describe('when AMPLIFY_APP_ORIGIN is not set', () => {
		it('it does NOT call globalSettings.setIsSSLOrigin() and isValidOrigin()', () => {
			delete process.env.AMPLIFY_APP_ORIGIN;
			createServerRunner({ config: mockAmplifyConfig });
			expect(mockIsValidOrigin).toHaveBeenCalledWith(undefined);
			expect(mockGlobalSettings.setIsSSLOrigin).not.toHaveBeenCalled();
			process.env.AMPLIFY_APP_ORIGIN = AMPLIFY_APP_ORIGIN;
		});
	});

	describe('when AMPLIFY_APP_ORIGIN is set with a https origin', () => {
		it('it calls globalSettings.setIsSSLOrigin(), isValidOrigin() and globalSettings.enableServerSideAuth', () => {
			createServerRunner({ config: mockAmplifyConfig });
			expect(mockIsValidOrigin).toHaveBeenCalledWith(AMPLIFY_APP_ORIGIN);
			expect(mockGlobalSettings.setIsSSLOrigin).toHaveBeenCalledWith(true);
			expect(mockGlobalSettings.enableServerSideAuth).toHaveBeenCalled();
		});
	});

	describe('runWithAmplifyServerContext', () => {
		describe('when amplifyConfig.Auth is not defined', () => {
			it('should call runWithAmplifyServerContextCore without Auth library options', () => {
				const mockAmplifyConfigWithoutAuth: ResourcesConfig = {
					Analytics: {
						Pinpoint: {
							appId: 'app-id',
							region: 'region',
						},
					},
				};

				mockParseAmplifyConfig.mockReturnValue(mockAmplifyConfigWithoutAuth);

				const { runWithAmplifyServerContext } = createServerRunner({
					config: mockAmplifyConfigWithoutAuth,
				});
				const operation = jest.fn();
				runWithAmplifyServerContext({ operation, nextServerContext: null });
				expect(mockRunWithAmplifyServerContextCore).toHaveBeenCalledWith(
					mockAmplifyConfigWithoutAuth,
					{},
					operation,
				);
				expect(createRunWithAmplifyServerContextSpy).toHaveBeenCalledWith({
					config: mockAmplifyConfigWithoutAuth,
					tokenValidator: undefined,
					globalSettings: mockGlobalSettings,
				});
			});
		});

		describe('when amplifyConfig.Auth is defined', () => {
			beforeEach(() => {
				mockParseAmplifyConfig.mockReturnValue(mockAmplifyConfig);
			});

			describe('when nextServerContext is null (opt-in unauthenticated role)', () => {
				it('should create auth providers with sharedInMemoryStorage', () => {
					const { runWithAmplifyServerContext } = createServerRunner({
						config: mockAmplifyConfig,
					});
					const operation = jest.fn();
					runWithAmplifyServerContext({ operation, nextServerContext: null });
					expect(
						mockCreateAWSCredentialsAndIdentityIdProvider,
					).toHaveBeenCalledWith(mockAmplifyConfig.Auth, sharedInMemoryStorage);
					expect(mockCreateUserPoolsTokenProvider).toHaveBeenCalledWith(
						mockAmplifyConfig.Auth,
						sharedInMemoryStorage,
					);
					expect(createRunWithAmplifyServerContextSpy).toHaveBeenCalledWith({
						config: mockAmplifyConfig,
						tokenValidator: expect.objectContaining({
							getItem: expect.any(Function),
						}),
						globalSettings: mockGlobalSettings,
					});
				});
			});

			describe('when nextServerContext is not null', () => {
				const mockNextServerContext = {
					req: {
						headers: {
							cookie: 'cookie',
						},
					},
					res: {
						setHeader: jest.fn(),
					},
				};
				const mockCookieStorageAdapter = {
					get: jest.fn(),
					set: jest.fn(),
					remove: jest.fn(),
				};

				it('should create auth providers with cookie storage adapter', async () => {
					const operation = jest.fn();

					mockCreateKeyValueStorageFromCookieStorageAdapter.mockReturnValueOnce(
						mockCookieStorageAdapter,
					);
					const { runWithAmplifyServerContext } = createServerRunner({
						config: mockAmplifyConfig,
					});
					await runWithAmplifyServerContext({
						operation,
						nextServerContext:
							mockNextServerContext as unknown as NextServer.Context,
					});
					expect(
						mockCreateAWSCredentialsAndIdentityIdProvider,
					).toHaveBeenCalledWith(
						mockAmplifyConfig.Auth,
						mockCookieStorageAdapter,
					);
					expect(mockCreateUserPoolsTokenProvider).toHaveBeenCalledWith(
						mockAmplifyConfig.Auth,
						mockCookieStorageAdapter,
					);
					expect(createRunWithAmplifyServerContextSpy).toHaveBeenCalledWith({
						config: mockAmplifyConfig,
						tokenValidator: expect.objectContaining({
							getItem: expect.any(Function),
						}),
						globalSettings: mockGlobalSettings,
					});
				});

				it('should call createKeyValueStorageFromCookieStorageAdapter with specified runtimeOptions.cookies', async () => {
					const testCookiesOptions: NextServer.CreateServerRunnerRuntimeOptions['cookies'] =
						{
							domain: '.example.com',
							sameSite: 'lax',
							expires: new Date('2024-09-05'),
						};
					mockGetRuntimeOptions.mockReturnValueOnce({
						cookies: testCookiesOptions,
					});
					mockCreateKeyValueStorageFromCookieStorageAdapter.mockReturnValueOnce(
						mockCookieStorageAdapter,
					);

					const { runWithAmplifyServerContext } = createServerRunner({
						config: mockAmplifyConfig,
						runtimeOptions: {
							cookies: testCookiesOptions,
						},
					});

					await runWithAmplifyServerContext({
						nextServerContext:
							mockNextServerContext as unknown as NextServer.Context,
						operation: jest.fn(),
					});

					expect(
						mockCreateKeyValueStorageFromCookieStorageAdapter,
					).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), {
						...testCookiesOptions,
						path: '/',
					});
				});

				it('should call createKeyValueStorageFromCookieStorageAdapter with enforced and default server auth cookie attributes', async () => {
					mockIsServerSideAuthEnabled.mockReturnValueOnce(true);
					mockGlobalSettingsIsSSLOrigin.mockReturnValueOnce(true);
					mockCreateKeyValueStorageFromCookieStorageAdapter.mockReturnValueOnce(
						mockCookieStorageAdapter,
					);

					const { runWithAmplifyServerContext } = createServerRunner({
						config: mockAmplifyConfig,
					});

					await runWithAmplifyServerContext({
						nextServerContext:
							mockNextServerContext as unknown as NextServer.Context,
						operation: jest.fn(),
					});

					expect(
						mockCreateKeyValueStorageFromCookieStorageAdapter,
					).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), {
						httpOnly: true,
						path: '/',
						sameSite: 'strict',
						secure: true,
					});
				});

				it('should call createKeyValueStorageFromCookieStorageAdapter with specified runtimeOptions.cookies with enforced server auth cookie attributes', async () => {
					const testCookiesOptions: NextServer.CreateServerRunnerRuntimeOptions['cookies'] =
						{
							domain: '.example.com',
							sameSite: 'lax',
							expires: new Date('2024-09-05'),
						};
					mockGetRuntimeOptions.mockReturnValueOnce({
						cookies: testCookiesOptions,
					});
					mockIsServerSideAuthEnabled.mockReturnValueOnce(true);
					mockGlobalSettingsIsSSLOrigin.mockReturnValueOnce(true);
					mockCreateKeyValueStorageFromCookieStorageAdapter.mockReturnValueOnce(
						mockCookieStorageAdapter,
					);

					const { runWithAmplifyServerContext } = createServerRunner({
						config: mockAmplifyConfig,
						runtimeOptions: {
							cookies: testCookiesOptions,
						},
					});

					await runWithAmplifyServerContext({
						nextServerContext:
							mockNextServerContext as unknown as NextServer.Context,
						operation: jest.fn(),
					});

					expect(
						mockCreateKeyValueStorageFromCookieStorageAdapter,
					).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), {
						...testCookiesOptions,
						path: '/',
						httpOnly: true,
						secure: true,
					});
				});
			});
		});
	});
});
