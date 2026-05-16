// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration-style tests using the real @aws-amplify/core Amplify singleton
 * (initSingleton.test.ts mocks core).
 */
import { Amplify as CoreAmplify, ResourcesConfig } from '@aws-amplify/core';

import { cognitoUserPoolsTokenProvider } from '../src/auth/cognito';
import { Amplify as DefaultAmplify } from '../src';

const poolAConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolClientId: 'client-a',
			userPoolId: 'pool-a',
		},
	},
};

const poolBConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolClientId: 'client-b',
			userPoolId: 'pool-b',
		},
	},
};

const storageLibraryOptions = {
	Storage: {
		S3: {
			defaultAccessLevel: 'private' as const,
			isObjectLockEnabled: true,
		},
	},
};

describe('DefaultAmplify.configure integration', () => {
	let setAuthConfigSpy: jest.SpyInstance;
	let setKeyValueStorageSpy: jest.SpyInstance;

	beforeEach(() => {
		CoreAmplify.libraryOptions = {};
		CoreAmplify.resourcesConfig = {};
		setAuthConfigSpy = jest.spyOn(
			cognitoUserPoolsTokenProvider,
			'setAuthConfig',
		);
		setKeyValueStorageSpy = jest.spyOn(
			cognitoUserPoolsTokenProvider,
			'setKeyValueStorage',
		);
	});

	afterEach(() => {
		setAuthConfigSpy.mockRestore();
		setKeyValueStorageSpy.mockRestore();
		CoreAmplify.libraryOptions = {};
		CoreAmplify.resourcesConfig = {};
	});

	it('keeps Storage and refreshes Cognito auth config on partial reconfigure', () => {
		DefaultAmplify.configure(poolAConfig, storageLibraryOptions);

		expect(CoreAmplify.libraryOptions.Storage).toEqual(
			storageLibraryOptions.Storage,
		);
		expect(CoreAmplify.libraryOptions.Auth?.tokenProvider).toBe(
			cognitoUserPoolsTokenProvider,
		);
		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolAConfig.Auth);

		setAuthConfigSpy.mockClear();

		DefaultAmplify.configure(poolBConfig, { ssr: false });

		expect(CoreAmplify.libraryOptions.Storage).toEqual(
			storageLibraryOptions.Storage,
		);
		expect(CoreAmplify.getConfig().Auth?.Cognito?.userPoolClientId).toBe(
			'client-b',
		);
		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolBConfig.Auth);
	});

	it('merges prior libraryOptions when libraryOptions.Auth overrides default provider', () => {
		DefaultAmplify.configure(poolAConfig, storageLibraryOptions);

		setAuthConfigSpy.mockClear();

		DefaultAmplify.configure(poolBConfig, {
			Auth: {
				tokenProvider: cognitoUserPoolsTokenProvider,
				credentialsProvider:
					CoreAmplify.libraryOptions.Auth!.credentialsProvider!,
			},
		});

		expect(CoreAmplify.libraryOptions.Storage).toEqual(
			storageLibraryOptions.Storage,
		);
		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolBConfig.Auth);
		expect(CoreAmplify.getConfig().Auth?.Cognito?.userPoolClientId).toBe(
			'client-b',
		);
	});

	it('syncs default Cognito auth config when only resource config is passed', () => {
		DefaultAmplify.configure(poolAConfig, storageLibraryOptions);

		setAuthConfigSpy.mockClear();

		DefaultAmplify.configure(poolBConfig);

		expect(CoreAmplify.libraryOptions.Storage).toEqual(
			storageLibraryOptions.Storage,
		);
		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolBConfig.Auth);
		expect(CoreAmplify.getConfig().Auth?.Cognito?.userPoolId).toBe('pool-b');
	});
});
