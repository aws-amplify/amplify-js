// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CredentialsAndIdentityIdProvider,
	TokenProvider,
	createConfigurationBuilder,
	isAmplifyContext,
} from '@aws-amplify/core';

import { createAmplifyContext } from '../src/configure';

import { amplifyOutputsFixture } from './fixtures/amplifyOutputs';

describe('createAmplifyContext()', () => {
	it('returns a branded, frozen AmplifyContext from an amplify_outputs fixture', () => {
		const ctx = createAmplifyContext(amplifyOutputsFixture);

		expect(isAmplifyContext(ctx)).toBe(true);
		expect(Object.isFrozen(ctx)).toBe(true);
	});

	it('parses Gen2 amplify_outputs into resourcesConfig', () => {
		const ctx = createAmplifyContext(amplifyOutputsFixture);

		expect(ctx.resourcesConfig.Auth?.Cognito.userPoolId).toBe(
			'eu-north-1_Ab12CdEfG',
		);
		expect(ctx.resourcesConfig.Auth?.Cognito.userPoolClientId).toBe(
			'1a2b3c4d5e6f7g8h9i0jklmnop',
		);
		expect(ctx.resourcesConfig.Auth?.Cognito.identityPoolId).toBe(
			'eu-north-1:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
		);
		expect(ctx.resourcesConfig.Storage?.S3?.bucket).toBe(
			'my-test-app-storage-bucket-abcdef123456',
		);
		expect(ctx.resourcesConfig.Storage?.S3?.region).toBe('eu-north-1');
		expect(ctx.resourcesConfig.API?.GraphQL?.endpoint).toBe(
			'https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.eu-north-1.amazonaws.com/graphql',
		);
		expect(ctx.resourcesConfig.API?.GraphQL?.apiKey).toBe(
			'da2-fakeapikey1234567890abcdef',
		);
	});

	it('exposes fetchAuthSession, clearCredentials, and getTokens', () => {
		const ctx = createAmplifyContext(amplifyOutputsFixture);

		expect(typeof ctx.fetchAuthSession).toBe('function');
		expect(typeof ctx.clearCredentials).toBe('function');
		expect(typeof ctx.getTokens).toBe('function');
	});

	it('attaches default Cognito token/credentials providers when none are supplied', () => {
		const ctx = createAmplifyContext(amplifyOutputsFixture);

		expect(ctx.libraryOptions.Auth?.tokenProvider).toBeDefined();
		expect(typeof ctx.libraryOptions.Auth?.tokenProvider?.getTokens).toBe(
			'function',
		);
		expect(ctx.libraryOptions.Auth?.credentialsProvider).toBeDefined();
		expect(
			typeof ctx.libraryOptions.Auth?.credentialsProvider
				?.getCredentialsAndIdentityId,
		).toBe('function');
	});

	it('isolates provider state between contexts (factory-style, not shared singletons)', () => {
		const ctx1 = createAmplifyContext(amplifyOutputsFixture);
		const ctx2 = createAmplifyContext(amplifyOutputsFixture);

		// Each context gets its own freshly-built provider instances so that two
		// contexts never share token/credentials state.
		expect(ctx1.libraryOptions.Auth?.tokenProvider).not.toBe(
			ctx2.libraryOptions.Auth?.tokenProvider,
		);
		expect(ctx1.libraryOptions.Auth?.credentialsProvider).not.toBe(
			ctx2.libraryOptions.Auth?.credentialsProvider,
		);
	});

	it('supports reconfiguration by calling createAmplifyContext() again', () => {
		const ctx1 = createAmplifyContext(amplifyOutputsFixture);
		const ctx2 = createAmplifyContext({
			...amplifyOutputsFixture,
			auth: {
				...amplifyOutputsFixture.auth,
				// eslint-disable-next-line camelcase
				user_pool_id: 'eu-north-1_NewPoolId',
			},
		});

		expect(ctx1.resourcesConfig.Auth?.Cognito.userPoolId).toBe(
			'eu-north-1_Ab12CdEfG',
		);
		expect(ctx2.resourcesConfig.Auth?.Cognito.userPoolId).toBe(
			'eu-north-1_NewPoolId',
		);
	});
});

describe('createAmplifyContext() — resolveLocalLibraryOptions branches', () => {
	it('returns no Auth options when the resource config has no Auth', () => {
		const ctx = createAmplifyContext({
			version: '1.4',
			storage: amplifyOutputsFixture.storage,
		});

		expect(ctx.resourcesConfig.Auth).toBeUndefined();
		expect(ctx.libraryOptions.Auth).toBeUndefined();
		expect(ctx.resourcesConfig.Storage?.S3?.bucket).toBe(
			'my-test-app-storage-bucket-abcdef123456',
		);
	});

	it('passes through caller-provided Auth libraryOptions unchanged', () => {
		const mockTokenProvider: TokenProvider = {
			getTokens: jest.fn().mockResolvedValue(undefined),
		};
		const mockCredentialsProvider: CredentialsAndIdentityIdProvider = {
			getCredentialsAndIdentityId: jest.fn().mockResolvedValue(undefined),
			clearCredentialsAndIdentityId: jest.fn(),
		};
		const ctx = createAmplifyContext(amplifyOutputsFixture, {
			Auth: {
				tokenProvider: mockTokenProvider,
				credentialsProvider: mockCredentialsProvider,
			},
		});

		expect(ctx.libraryOptions.Auth?.tokenProvider).toBe(mockTokenProvider);
		expect(ctx.libraryOptions.Auth?.credentialsProvider).toBe(
			mockCredentialsProvider,
		);
	});

	it('builds default providers with cookie storage when ssr is true', () => {
		const ctx = createAmplifyContext(amplifyOutputsFixture, { ssr: true });

		expect(ctx.libraryOptions.ssr).toBe(true);
		expect(ctx.libraryOptions.Auth?.tokenProvider).toBeDefined();
		expect(ctx.resourcesConfig.Auth?.Cognito.userPoolId).toBe(
			'eu-north-1_Ab12CdEfG',
		);
	});
});

describe('createConfigurationBuilder() interop', () => {
	it('produces a frozen config that round-trips through createAmplifyContext()', () => {
		const config = createConfigurationBuilder({ from: amplifyOutputsFixture })
			.patch('Auth', {
				Cognito: { userPoolId: 'eu-north-1_Replaced' },
			})
			.build();

		expect(Object.isFrozen(config)).toBe(true);

		const ctx = createAmplifyContext(config);

		expect(ctx.resourcesConfig.Auth?.Cognito.userPoolId).toBe(
			'eu-north-1_Replaced',
		);
		expect(ctx.resourcesConfig.Storage?.S3?.bucket).toBe(
			'my-test-app-storage-bucket-abcdef123456',
		);
	});
});
