// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createConfigurationBuilder } from '@aws-amplify/core';

import { configure } from '../src/configure';

import { amplifyOutputsFixture } from './fixtures/amplifyOutputs';

describe('configure()', () => {
	it('returns a frozen AmplifyContext from amplify_outputs fixture', () => {
		const ctx = configure(amplifyOutputsFixture);

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
		const ctx = configure(amplifyOutputsFixture);

		expect(typeof ctx.fetchAuthSession).toBe('function');
		expect(typeof ctx.clearCredentials).toBe('function');
		expect(typeof ctx.getTokens).toBe('function');
	});

	it('supports reconfiguration by calling configure() again', () => {
		const ctx1 = configure(amplifyOutputsFixture);
		const ctx2 = configure({
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

describe('createConfigurationBuilder()', () => {
	it('round-trips through configure()', () => {
		const config = createConfigurationBuilder()
			.auth(amplifyOutputsFixture.auth)
			.storage(amplifyOutputsFixture.storage)
			.data(amplifyOutputsFixture.data)
			.build();

		expect(config.version).toBe('1.4');
		expect(Object.isFrozen(config)).toBe(true);

		const ctx = configure(config);

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

		const ctx = configure(config);

		expect(ctx.resourcesConfig.Auth?.Cognito.userPoolId).toBe(
			'eu-north-1_Replaced',
		);
	});
});

describe('configure() branch coverage', () => {
	it('works without Auth config', () => {
		const ctx = configure({
			Storage: { S3: { bucket: 'b', region: 'us-east-1' } },
		});
		expect(ctx.resourcesConfig.Storage?.S3?.bucket).toBe('b');
		expect(ctx.resourcesConfig.Auth).toBeUndefined();
	});

	it('preserves custom Auth libraryOptions', () => {
		const customTokenProvider = { getTokens: jest.fn() };
		const ctx = configure(amplifyOutputsFixture, {
			Auth: { tokenProvider: customTokenProvider } as any,
		});
		expect(ctx.libraryOptions.Auth?.tokenProvider).toBe(customTokenProvider);
	});

	it('uses CookieStorage when ssr is true', () => {
		const ctx = configure(amplifyOutputsFixture, { ssr: true });
		expect(ctx.libraryOptions.Auth).toBeDefined();
		expect(ctx.libraryOptions.Auth?.tokenProvider).toBeDefined();
	});

	it('returns empty libraryOptions when no Auth and no options', () => {
		const ctx = configure({ Storage: { S3: { bucket: 'b', region: 'r' } } });
		expect(ctx.libraryOptions).toEqual({});
	});
});
