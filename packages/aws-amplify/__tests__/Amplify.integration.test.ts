// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration-style tests for the `Amplify` facade using the REAL
 * `@aws-amplify/core` global context and the REAL singleton Cognito token
 * provider. Only the provider's `setAuthConfig` / `setKeyValueStorage` methods
 * are spied on (a boundary), preserving their real implementations.
 */
import { ResourcesConfig, getGlobalContext } from '@aws-amplify/core';
import { clearGlobalContext } from '@aws-amplify/core/internals/utils';

import { cognitoUserPoolsTokenProvider } from '../src/auth/cognito';
import { Amplify } from '../src';

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

describe('Amplify.configure integration', () => {
	let setAuthConfigSpy: jest.SpyInstance;
	let setKeyValueStorageSpy: jest.SpyInstance;

	beforeEach(() => {
		clearGlobalContext();
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
		clearGlobalContext();
	});

	it('refreshes Cognito auth config on reconfigure with partial libraryOptions', () => {
		Amplify.configure(poolAConfig);
		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolAConfig.Auth);

		setAuthConfigSpy.mockClear();
		setKeyValueStorageSpy.mockClear();

		Amplify.configure(poolBConfig, { ssr: false });

		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolBConfig.Auth);
		expect(setKeyValueStorageSpy).toHaveBeenCalled();
		expect(Amplify.getConfig().Auth?.Cognito?.userPoolClientId).toBe(
			'client-b',
		);
	});

	it('passes through when libraryOptions.Auth is provided', () => {
		Amplify.configure(poolAConfig);

		setAuthConfigSpy.mockClear();

		Amplify.configure(poolBConfig, {
			Auth: {
				tokenProvider: cognitoUserPoolsTokenProvider,
				credentialsProvider: {
					getCredentialsAndIdentityId: jest.fn().mockResolvedValue(undefined),
					clearCredentialsAndIdentityId: jest.fn(),
				},
			},
		});

		expect(setAuthConfigSpy).not.toHaveBeenCalled();
		expect(Amplify.getConfig().Auth?.Cognito?.userPoolClientId).toBe(
			'client-b',
		);
	});

	// Regression guard for the stale-token-provider-on-reconfigure bug
	// (restores the #14819 contract): reconfiguring with ONLY a new resource
	// config must still re-push setAuthConfig with the NEW Auth so user-pool
	// token refresh retargets the new pool — even though getConfig() alone would
	// mask the staleness. The previously-resolved NON-Auth library options are
	// still preserved (the Phase C behavior stays; only the Auth staleness goes).
	it('re-syncs the token provider to the new pool on reconfigure with only a resource config', () => {
		Amplify.configure(poolAConfig);
		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolAConfig.Auth);

		setAuthConfigSpy.mockClear();
		setKeyValueStorageSpy.mockClear();

		Amplify.configure(poolBConfig);

		// Assert on the provider, not just getConfig(): the singleton token
		// provider's authConfig now targets pool-b.
		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolBConfig.Auth);
		expect(setKeyValueStorageSpy).toHaveBeenCalled();
		expect(Amplify.getConfig().Auth?.Cognito?.userPoolId).toBe('pool-b');
	});

	it('preserves previous NON-Auth library options on reconfigure with only a resource config', () => {
		Amplify.configure(poolAConfig, {
			Storage: { S3: { defaultAccessLevel: 'private' } },
		});

		setAuthConfigSpy.mockClear();

		Amplify.configure(poolBConfig);

		// Auth staleness is fixed ...
		expect(setAuthConfigSpy).toHaveBeenCalledWith(poolBConfig.Auth);
		// ... but the custom non-Auth option from configure #1 survives.
		expect(
			getGlobalContext().libraryOptions.Storage?.S3?.defaultAccessLevel,
		).toBe('private');
	});
});
