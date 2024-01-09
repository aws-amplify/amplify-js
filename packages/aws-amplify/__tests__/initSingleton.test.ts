// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify as AmplifySingleton,
	CookieStorage,
	ResourcesConfig,
	defaultStorage,
	LibraryOptions,
	consoleProvider,
	cloudWatchProvider,
} from '@aws-amplify/core';
import { ConsoleProvider as ConsoleProviderType } from '@aws-amplify/core/src/logging/providers/console';
import {
	cognitoUserPoolsTokenProvider,
	cognitoCredentialsProvider,
} from '../src/auth/cognito';

import { Amplify } from '../src';

jest.mock('@aws-amplify/core');
jest.mock('../src/auth/cognito', () => ({
	cognitoUserPoolsTokenProvider: {
		setAuthConfig: jest.fn(),
		setKeyValueStorage: jest.fn(),
	},
	cognitoCredentialsProvider: jest.fn(),
}));

const mockCognitoUserPoolsTokenProviderSetAuthConfig =
	cognitoUserPoolsTokenProvider.setAuthConfig as jest.Mock;
const mockCognitoUserPoolsTokenProviderSetKeyValueStorage =
	cognitoUserPoolsTokenProvider.setKeyValueStorage as jest.Mock;
const mockAmplifySingletonConfigure = AmplifySingleton.configure as jest.Mock;
const mockAmplifySingletonGetConfig = AmplifySingleton.getConfig as jest.Mock;
const MockCookieStorage = CookieStorage as jest.Mock;

const mockResourceConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolClientId: 'userPoolClientId',
			userPoolId: 'userPoolId',
		},
	},
	Storage: {
		S3: {
			bucket: 'bucket',
			region: 'us-west-2',
		},
	},
};
const libraryLoggerOptions: LibraryOptions = {
	Logging: {
		console: consoleProvider,
	},
};

describe('initSingleton (DefaultAmplify)', () => {
	const mockCookieStorageInstance = {};
	beforeAll(() => {
		MockCookieStorage.mockImplementation(() => mockCookieStorageInstance);
	});
	beforeEach(() => {
		mockAmplifySingletonConfigure.mockImplementation((_, libraryOptions) => {
			AmplifySingleton.libraryOptions =
				libraryOptions ?? AmplifySingleton.libraryOptions;
		});
		// reset to its initial state
		AmplifySingleton.libraryOptions = {};
	});

	afterEach(() => {
		MockCookieStorage.mockClear();
		mockCognitoUserPoolsTokenProviderSetAuthConfig.mockReset();
		mockCognitoUserPoolsTokenProviderSetKeyValueStorage.mockReset();
		mockAmplifySingletonConfigure.mockReset();
		mockAmplifySingletonGetConfig.mockReset();
	});

	describe('DefaultAmplify.configure()', () => {
		it('should take the legacy CLI shaped config object for configuring the underlying Amplify Singleton', () => {
			const mockLegacyConfig = {
				aws_project_region: 'us-west-2',
				aws_cognito_identity_pool_id: 'aws_cognito_identity_pool_id',
				aws_cognito_region: 'aws_cognito_region',
				aws_user_pools_id: 'aws_user_pools_id',
				aws_user_pools_web_client_id: 'aws_user_pools_web_client_id',
				oauth: {},
				aws_cognito_username_attributes: [],
				aws_cognito_social_providers: [],
				aws_cognito_signup_attributes: [],
				aws_cognito_mfa_configuration: 'OFF',
				aws_cognito_mfa_types: ['SMS'],
				aws_cognito_password_protection_settings: {
					passwordPolicyMinLength: 8,
					passwordPolicyCharacters: [],
				},
				aws_cognito_verification_mechanisms: ['PHONE_NUMBER'],
			};

			Amplify.configure(mockLegacyConfig);

			const resourcesConfig: ResourcesConfig = {
				Auth: {
					Cognito: {
						allowGuestAccess: true,
						identityPoolId: 'aws_cognito_identity_pool_id',
						loginWith: {
							email: false,
							phone: false,
							username: true,
						},
						mfa: {
							smsEnabled: true,
							status: 'off',
							totpEnabled: false,
						},
						passwordFormat: {
							minLength: 8,
							requireLowercase: false,
							requireNumbers: false,
							requireSpecialCharacters: false,
							requireUppercase: false,
						},
						userAttributes: { phone_number: { required: true } },
						userPoolClientId: 'aws_user_pools_web_client_id',
						userPoolId: 'aws_user_pools_id',
					},
				},
			};

			expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
				resourcesConfig,
				expect.anything()
			);
		});

		it('should just configure with the provided config and options when ResourcesConfig.Auth is not defined', () => {
			const resourceConfig = { Storage: mockResourceConfig.Storage };
			const libraryOptions = {};
			Amplify.configure(resourceConfig, libraryOptions);

			expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
				resourceConfig,
				{ ...libraryLoggerOptions, ...libraryOptions }
			);
		});

		describe('when ResourcesConfig.Auth is defined', () => {
			it('should just configure with the provided config and options when libraryOptions.Auth is defined', () => {
				const libraryOptions = {
					Auth: { tokenProvider: { getTokens: jest.fn() } },
				};
				Amplify.configure(mockResourceConfig, libraryOptions);

				expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
					mockResourceConfig,
					{ ...libraryLoggerOptions, ...libraryOptions }
				);
			});

			describe('when the singleton libraryOptions have not yet been configured with Auth', () => {
				it('should configure with default auth providers and a new CookieStorage instance', () => {
					const libraryOptions = { ssr: true };
					Amplify.configure(mockResourceConfig, libraryOptions);

					expect(
						mockCognitoUserPoolsTokenProviderSetAuthConfig
					).toHaveBeenCalledWith(mockResourceConfig.Auth);
					expect(MockCookieStorage).toHaveBeenCalledWith({ sameSite: 'lax' });
					expect(
						mockCognitoUserPoolsTokenProviderSetKeyValueStorage
					).toHaveBeenCalledWith(mockCookieStorageInstance);
					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						mockResourceConfig,
						{
							...libraryLoggerOptions,
							...libraryOptions,
							Auth: {
								tokenProvider: cognitoUserPoolsTokenProvider,
								credentialsProvider: cognitoCredentialsProvider,
							},
						}
					);
				});

				it('should configure with default auth providers and defaultStorage', () => {
					const libraryOptions = {};
					Amplify.configure(mockResourceConfig, libraryOptions);

					expect(
						mockCognitoUserPoolsTokenProviderSetAuthConfig
					).toHaveBeenCalledWith(mockResourceConfig.Auth);
					expect(
						mockCognitoUserPoolsTokenProviderSetKeyValueStorage
					).toHaveBeenCalledWith(defaultStorage);
					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						mockResourceConfig,
						{
							...libraryLoggerOptions,
							...libraryOptions,
							Auth: {
								tokenProvider: cognitoUserPoolsTokenProvider,
								credentialsProvider: cognitoCredentialsProvider,
							},
						}
					);
				});
			});

			describe('when the singleton libraryOptions have been previously configured with Auth', () => {
				beforeEach(() => {
					AmplifySingleton.libraryOptions = {
						...libraryLoggerOptions,
						Auth: {
							tokenProvider: cognitoUserPoolsTokenProvider,
							credentialsProvider: cognitoCredentialsProvider,
						},
					};
				});

				it('should preserve current auth providers (default or otherwise) and configure provider with a new CookieStorage instance', () => {
					const libraryOptions = { ssr: true };
					Amplify.configure(mockResourceConfig, libraryOptions);

					expect(
						mockCognitoUserPoolsTokenProviderSetAuthConfig
					).not.toHaveBeenCalled();
					expect(MockCookieStorage).toHaveBeenCalledWith({ sameSite: 'lax' });
					expect(
						mockCognitoUserPoolsTokenProviderSetKeyValueStorage
					).toHaveBeenCalledWith(mockCookieStorageInstance);
					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						mockResourceConfig,
						{
							Logging: AmplifySingleton.libraryOptions.Logging,
							Auth: AmplifySingleton.libraryOptions.Auth,
							...libraryOptions,
						}
					);
				});

				it('should preserve current auth providers (default or otherwise) and configure provider with defaultStorage', () => {
					const libraryOptions = { ssr: false };
					Amplify.configure(mockResourceConfig, libraryOptions);

					expect(
						mockCognitoUserPoolsTokenProviderSetAuthConfig
					).not.toHaveBeenCalled();
					expect(
						mockCognitoUserPoolsTokenProviderSetKeyValueStorage
					).toHaveBeenCalledWith(defaultStorage);
					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						mockResourceConfig,
						{
							Logging: AmplifySingleton.libraryOptions.Logging,
							Auth: AmplifySingleton.libraryOptions.Auth,
							...libraryOptions,
						}
					);
				});

				it('should preserve current auth providers (default or otherwise)', () => {
					const libraryOptions = {
						Storage: { S3: { isObjectLockEnabled: true } },
					};
					Amplify.configure(mockResourceConfig, libraryOptions);

					expect(
						mockCognitoUserPoolsTokenProviderSetAuthConfig
					).not.toHaveBeenCalled();
					expect(MockCookieStorage).not.toHaveBeenCalled();
					expect(
						mockCognitoUserPoolsTokenProviderSetKeyValueStorage
					).not.toHaveBeenCalled();
					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						mockResourceConfig,
						{
							Logging: AmplifySingleton.libraryOptions.Logging,
							Auth: AmplifySingleton.libraryOptions.Auth,
							...libraryOptions,
						}
					);
				});

				it('should just configure without touching libraryOptions', () => {
					Amplify.configure(mockResourceConfig);

					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						mockResourceConfig
					);
				});
			});

			it('should invoke AmplifySingleton.configure with other provided library options', () => {
				const libraryOptionsWithStorage = {
					Storage: {
						S3: {
							defaultAccessLevel: 'private',
							isObjectLockEnabled: true,
						},
					},
				};

				Amplify.configure(mockResourceConfig, {
					Storage: {
						S3: {
							defaultAccessLevel: 'private',
							isObjectLockEnabled: true,
						},
					},
				});

				expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
					mockResourceConfig,
					{
						Auth: {
							tokenProvider: cognitoUserPoolsTokenProvider,
							credentialsProvider: cognitoCredentialsProvider,
						},
						...libraryOptionsWithStorage,
						...libraryLoggerOptions,
					}
				);
			});
		});

		describe('when configuring logging providers', () => {
			const resourceConfig = { Auth: mockResourceConfig.Auth };
			describe('when the singleton libraryOptions has not yet been configured with logging', () => {
				it('should configure default console provider', () => {
					Amplify.configure(resourceConfig);

					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						resourceConfig,
						{
							Auth: AmplifySingleton.libraryOptions.Auth,
							...libraryLoggerOptions,
						}
					);
				});

				it('should configure console provider', () => {
					Amplify.configure(resourceConfig, {
						Logging: {
							console: consoleProvider,
						},
					});
					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						resourceConfig,
						{
							Auth: AmplifySingleton.libraryOptions.Auth,
							Logging: {
								console: consoleProvider,
							},
						}
					);
				});

				it('should configure additional providers and default console provider', () => {
					Amplify.configure(resourceConfig, {
						Logging: {
							additionalProviders: [cloudWatchProvider],
						},
					});

					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						resourceConfig,
						{
							Auth: AmplifySingleton.libraryOptions.Auth,
							Logging: {
								console: consoleProvider,
								additionalProviders: [cloudWatchProvider],
							},
						}
					);
				});

				it('should configure additional providers and console provider', () => {
					Amplify.configure(resourceConfig, {
						Logging: {
							console: consoleProvider,
							additionalProviders: [cloudWatchProvider],
						},
					});

					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						resourceConfig,
						{
							Auth: AmplifySingleton.libraryOptions.Auth,
							Logging: {
								console: consoleProvider,
								additionalProviders: [cloudWatchProvider],
							},
						}
					);
				});
			});

			describe('when the singleton libraryOptions has been configured with Logging', () => {
				beforeEach(() => {
					AmplifySingleton.libraryOptions = {
						Auth: {
							tokenProvider: cognitoUserPoolsTokenProvider,
							credentialsProvider: cognitoCredentialsProvider,
						},
						...libraryLoggerOptions,
					};
				});

				it('should override configured console provider', () => {
					const mockConsoleProvider: ConsoleProviderType = {
						LOG_LEVEL: null,
						initialize: function (): void {},
						log: function (): void {},
						flushLogs: function (): Promise<void> {
							return Promise.resolve();
						},
						enable: function (): void {},
						disable: function (): void {},
					};

					Amplify.configure(resourceConfig, {
						Logging: {
							console: mockConsoleProvider,
						},
					});

					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						resourceConfig,
						{
							Auth: AmplifySingleton.libraryOptions.Auth,
							Logging: {
								console: mockConsoleProvider,
							},
						}
					);
				});

				it('should configure additional providers and preserve configured console provider', () => {
					Amplify.configure(resourceConfig, {
						Logging: {
							additionalProviders: [cloudWatchProvider],
						},
					});

					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						resourceConfig,
						{
							Auth: AmplifySingleton.libraryOptions.Auth,
							Logging: {
								console: AmplifySingleton.libraryOptions.Logging?.console,
								additionalProviders: [cloudWatchProvider],
							},
						}
					);
				});
			});
		});
	});

	describe('DefaultAmplify.getConfig()', () => {
		it('should invoke AmplifySingleton.getConfig and return its result', () => {
			mockAmplifySingletonGetConfig.mockReturnValueOnce(mockResourceConfig);
			const result = Amplify.getConfig();

			expect(mockAmplifySingletonGetConfig).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockResourceConfig);
		});
	});
});
