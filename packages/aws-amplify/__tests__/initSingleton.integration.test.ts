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

	it('refreshes Cognito auth config on reconfigure with partial libraryOptions', () => {
		DefaultAmplify.configure(poolAConfig);

		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolAConfig.Auth);

		setAuthConfigSpy.mockClear();
		setKeyValueStorageSpy.mockClear();

		DefaultAmplify.configure(poolBConfig, { ssr: false });

		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolBConfig.Auth);
		expect(setKeyValueStorageSpy).toHaveBeenCalled();
		expect(CoreAmplify.getConfig().Auth?.Cognito?.userPoolClientId).toBe(
			'client-b',
		);
	});

	it('passes through when libraryOptions.Auth is provided', () => {
		DefaultAmplify.configure(poolAConfig);

		setAuthConfigSpy.mockClear();

		DefaultAmplify.configure(poolBConfig, {
			Auth: {
				tokenProvider: cognitoUserPoolsTokenProvider,
				credentialsProvider:
					CoreAmplify.libraryOptions.Auth!.credentialsProvider!,
			},
		});

		expect(setAuthConfigSpy).not.toHaveBeenCalled();
		expect(CoreAmplify.getConfig().Auth?.Cognito?.userPoolClientId).toBe(
			'client-b',
		);
	});

	it('refreshes Cognito auth config when only resource config is passed', () => {
		DefaultAmplify.configure(poolAConfig);

		setAuthConfigSpy.mockClear();
		setKeyValueStorageSpy.mockClear();

		DefaultAmplify.configure(poolBConfig);

		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolBConfig.Auth);
		expect(setKeyValueStorageSpy).toHaveBeenCalled();
		expect(CoreAmplify.getConfig().Auth?.Cognito?.userPoolId).toBe('pool-b');
	});
});
