// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify as AmplifySingleton,
	CookieStorage,
	ResourcesConfig,
	TokenProvider,
	defaultStorage,
} from '@aws-amplify/core';
import {
	CognitoUserPoolsTokenProvider,
	cognitoCredentialsProvider,
} from '../src/auth/cognito';

import { Amplify } from '../src';

jest.mock('@aws-amplify/core');
jest.mock('../src/auth/cognito', () => ({
	CognitoUserPoolsTokenProvider: {
		setAuthConfig: jest.fn(),
		setKeyValueStorage: jest.fn(),
	},
	cognitoCredentialsProvider: jest.fn(),
}));

const mockCognitoUserPoolsTokenProviderSetAuthConfig =
	CognitoUserPoolsTokenProvider.setAuthConfig as jest.Mock;
const mockCognitoUserPoolsTokenProviderSetKeyValueStorage =
	CognitoUserPoolsTokenProvider.setKeyValueStorage as jest.Mock;
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

describe('initSingleton (DefaultAmplify)', () => {
	beforeEach(() => {
		mockCognitoUserPoolsTokenProviderSetAuthConfig.mockReset();
		mockCognitoUserPoolsTokenProviderSetKeyValueStorage.mockReset();
		mockAmplifySingletonConfigure.mockReset();
		mockAmplifySingletonGetConfig.mockReset();
	});

	describe('DefaultAmplify.configure()', () => {
		describe('when ResourcesConfig.Auth is defined', () => {
			describe('when libraryOptions.Auth is undefined', () => {
				it('should invoke AmplifySingleton.configure with the default auth providers', () => {
					Amplify.configure(mockResourceConfig);

					expect(
						mockCognitoUserPoolsTokenProviderSetAuthConfig
					).toHaveBeenCalledWith(mockResourceConfig.Auth);

					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						mockResourceConfig,
						{
							Auth: {
								tokenProvider: CognitoUserPoolsTokenProvider,
								credentialsProvider: cognitoCredentialsProvider,
							},
						}
					);
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
								tokenProvider: CognitoUserPoolsTokenProvider,
								credentialsProvider: cognitoCredentialsProvider,
							},
							...libraryOptionsWithStorage,
						}
					);
				});

				it('should use defaultStorage for the default CognitoUserPoolsTokenProvider', () => {
					Amplify.configure(mockResourceConfig);

					expect(
						mockCognitoUserPoolsTokenProviderSetKeyValueStorage
					).toHaveBeenCalledWith(defaultStorage);
				});

				it('should use cookie storage if LibraryOptions.ssr is set to true for the default CognitoUserPoolsTokenProvider', () => {
					Amplify.configure(mockResourceConfig, { ssr: true });

					expect(MockCookieStorage).toHaveBeenCalledWith({
						sameSite: 'strict',
					});
					expect(
						mockCognitoUserPoolsTokenProviderSetKeyValueStorage
					).toHaveBeenCalledTimes(1);
				});
			});

			describe('when libraryOptions.Auth is defined', () => {
				it('should forward the libraryOptions to AmplifySingleton.configure', () => {
					const mockTokenProvider: TokenProvider = {
						getTokens: jest.fn(),
					};
					const mockLibraryOptions = {
						Auth: {
							tokenProvider: mockTokenProvider,
						},
					};
					Amplify.configure(mockResourceConfig, mockLibraryOptions);

					expect(mockAmplifySingletonConfigure).toHaveBeenCalledWith(
						mockResourceConfig,
						mockLibraryOptions
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
