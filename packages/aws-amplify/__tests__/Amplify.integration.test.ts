// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration-style tests for the `Amplify` facade using the REAL
 * `@aws-amplify/core` global context and the REAL singleton Cognito token
 * provider. Only the provider's `setAuthConfig` / `setKeyValueStorage` methods
 * are spied on (a boundary), preserving their real implementations.
 */
import { ResourcesConfig } from '@aws-amplify/core';
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

	// Behavioral change vs. the old DefaultAmplify (documented in the C2 handoff):
	// reconfiguring with ONLY a resource config now PRESERVES the previously
	// resolved library options (the facade no longer re-pushes default providers
	// on every call), while still updating the published resourcesConfig.
	it('preserves previous library options but updates resourcesConfig when only a resource config is passed', () => {
		Amplify.configure(poolAConfig);

		setAuthConfigSpy.mockClear();
		setKeyValueStorageSpy.mockClear();

		Amplify.configure(poolBConfig);

		expect(setAuthConfigSpy).not.toHaveBeenCalled();
		expect(Amplify.getConfig().Auth?.Cognito?.userPoolId).toBe('pool-b');
	});
});
