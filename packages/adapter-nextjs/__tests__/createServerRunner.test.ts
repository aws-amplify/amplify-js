// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig, sharedInMemoryStorage } from '@aws-amplify/core';

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

describe('createServerRunner', () => {
	let createServerRunner: NextServer.CreateServerRunner;

	const mockParseAmplifyConfig = jest.fn(config => config);
	const mockCreateAWSCredentialsAndIdentityIdProvider = jest.fn();
	const mockCreateKeyValueStorageFromCookieStorageAdapter = jest.fn();
	const mockCreateUserPoolsTokenProvider = jest.fn();
	const mockRunWithAmplifyServerContextCore = jest.fn();
	const mockCreateAuthRouteHandlersFactory = jest.fn(() => jest.fn());

	beforeEach(() => {
		jest.resetModules();
		jest.doMock('aws-amplify/adapter-core', () => ({
			createAWSCredentialsAndIdentityIdProvider:
				mockCreateAWSCredentialsAndIdentityIdProvider,
			createKeyValueStorageFromCookieStorageAdapter:
				mockCreateKeyValueStorageFromCookieStorageAdapter,
			createUserPoolsTokenProvider: mockCreateUserPoolsTokenProvider,
			runWithAmplifyServerContext: mockRunWithAmplifyServerContextCore,
		}));
		jest.doMock('@aws-amplify/core/internals/utils', () => ({
			parseAmplifyConfig: mockParseAmplifyConfig,
		}));
		jest.doMock('../src/auth', () => ({
			createAuthRouteHandlersFactory: mockCreateAuthRouteHandlersFactory,
		}));

		({ createServerRunner } = require('../src'));

		mockCreateAuthRouteHandlersFactory.mockReturnValue(jest.fn());
	});

	afterEach(() => {
		mockParseAmplifyConfig.mockClear();
		mockCreateAWSCredentialsAndIdentityIdProvider.mockClear();
		mockCreateKeyValueStorageFromCookieStorageAdapter.mockClear();
		mockCreateUserPoolsTokenProvider.mockClear();
		mockRunWithAmplifyServerContextCore.mockClear();
		mockCreateAuthRouteHandlersFactory.mockClear();
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
			runtimeOptions: undefined,
		});
		expect(result).toMatchObject({
			createAuthRouteHandlers: expect.any(Function),
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

				it('should create auth providers with cookie storage adapter', () => {
					const operation = jest.fn();

					mockCreateKeyValueStorageFromCookieStorageAdapter.mockReturnValueOnce(
						mockCookieStorageAdapter,
					);
					const { runWithAmplifyServerContext } = createServerRunner({
						config: mockAmplifyConfig,
					});
					runWithAmplifyServerContext({
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
				});

				it('should call createKeyValueStorageFromCookieStorageAdapter with specified runtimeOptions.cookies', () => {
					const testCookiesOptions: NextServer.CreateServerRunnerRuntimeOptions['cookies'] =
						{
							domain: '.example.com',
							sameSite: 'lax',
							expires: new Date('2024-09-05'),
						};
					mockCreateKeyValueStorageFromCookieStorageAdapter.mockReturnValueOnce(
						mockCookieStorageAdapter,
					);

					const { runWithAmplifyServerContext } = createServerRunner({
						config: mockAmplifyConfig,
						runtimeOptions: {
							cookies: testCookiesOptions,
						},
					});

					runWithAmplifyServerContext({
						nextServerContext:
							mockNextServerContext as unknown as NextServer.Context,
						operation: jest.fn(),
					});

					expect(
						mockCreateKeyValueStorageFromCookieStorageAdapter,
					).toHaveBeenCalledWith(
						expect.any(Object),
						expect.any(Object),
						testCookiesOptions,
					);

					// modify by reference should not affect the original configuration
					testCookiesOptions.sameSite = 'strict';
					runWithAmplifyServerContext({
						nextServerContext:
							mockNextServerContext as unknown as NextServer.Context,
						operation: jest.fn(),
					});

					expect(
						mockCreateKeyValueStorageFromCookieStorageAdapter,
					).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), {
						...testCookiesOptions,
						sameSite: 'lax',
					});
				});
			});
		});
	});
});
