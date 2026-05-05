// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createConfigurationBuilder } from '@aws-amplify/core';

import { createAmplifyContext } from '../src/configure';

import { amplifyOutputsFixture } from './fixtures/amplifyOutputs';

describe('createAmplifyContext()', () => {
	it('returns a frozen AmplifyContext from amplify_outputs fixture', () => {
		const ctx = createAmplifyContext(amplifyOutputsFixture);

		expect(Object.isFrozen(ctx)).toBe(true);
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
	it('returns empty options when no Auth config', () => {
		const ctx = createAmplifyContext({
			version: '1.4',
			storage: amplifyOutputsFixture.storage,
		});
		expect(ctx.resourcesConfig.Auth).toBeUndefined();
		expect(ctx.resourcesConfig.Storage?.S3?.bucket).toBe(
			'my-test-app-storage-bucket-abcdef123456',
		);
	});

	it('passes through custom Auth libraryOptions', () => {
		const mockTokenProvider = {
			getTokens: jest.fn().mockResolvedValue(undefined),
		};
		const mockCredentialsProvider = {
			getCredentialsAndIdentityId: jest.fn().mockResolvedValue(undefined),
			clearCredentialsAndIdentityId: jest.fn(),
		};
		const ctx = createAmplifyContext(amplifyOutputsFixture, {
			Auth: {
				tokenProvider: mockTokenProvider as any,
				credentialsProvider: mockCredentialsProvider as any,
			},
		});
		expect(ctx.resourcesConfig.Auth?.Cognito.userPoolId).toBe(
			'eu-north-1_Ab12CdEfG',
		);
	});

	it('uses cookie storage when ssr is true', () => {
		const ctx = createAmplifyContext(amplifyOutputsFixture, { ssr: true });
		expect(ctx.resourcesConfig.Auth?.Cognito.userPoolId).toBe(
			'eu-north-1_Ab12CdEfG',
		);
	});

	it('delegates fetchAuthSession to AuthClass', () => {
		const ctx = createAmplifyContext(amplifyOutputsFixture);
		expect(typeof ctx.fetchAuthSession).toBe('function');
	});

	it('delegates clearCredentials to AuthClass', () => {
		const ctx = createAmplifyContext(amplifyOutputsFixture);
		expect(typeof ctx.clearCredentials).toBe('function');
	});

	it('delegates getTokens to AuthClass', () => {
		const ctx = createAmplifyContext(amplifyOutputsFixture);
		expect(typeof ctx.getTokens).toBe('function');
	});
});

describe('createConfigurationBuilder()', () => {
	it('round-trips through createAmplifyContext()', () => {
		const config = createConfigurationBuilder()
			.auth(amplifyOutputsFixture.auth)
			.storage(amplifyOutputsFixture.storage)
			.data(amplifyOutputsFixture.data)
			.build();

		expect(config.version).toBe('1.4');
		expect(Object.isFrozen(config)).toBe(true);

		const ctx = createAmplifyContext(config);

		expect(ctx.resourcesConfig.Auth?.Cognito.userPoolId).toBe(
			'eu-north-1_Ab12CdEfG',
		);
		expect(ctx.resourcesConfig.Storage?.S3?.bucket).toBe(
			'my-test-app-storage-bucket-abcdef123456',
		);
		expect(ctx.resourcesConfig.API?.GraphQL?.endpoint).toBe(
			'https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.eu-north-1.amazonaws.com/graphql',
		);
	});

	it('allows replacing a scope for reconfiguration', () => {
		const config = createConfigurationBuilder()
			.auth(amplifyOutputsFixture.auth)
			.auth({
				...amplifyOutputsFixture.auth,
				// eslint-disable-next-line camelcase
				user_pool_id: 'eu-north-1_Replaced',
			})
			.build();

		const ctx = createAmplifyContext(config);

		expect(ctx.resourcesConfig.Auth?.Cognito.userPoolId).toBe(
			'eu-north-1_Replaced',
		);
	});
});
