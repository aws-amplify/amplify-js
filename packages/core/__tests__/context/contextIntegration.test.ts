// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '../../src/singleton';
import {
	getGlobalContext,
	hasGlobalContext,
	isAmplifyContext,
} from '../../src';
import { clearGlobalContext } from '../../src/libraryUtils';

describe('Amplify.configure() context integration', () => {
	afterEach(() => {
		clearGlobalContext();
		Amplify.configure({});
	});

	it('sets a global context after configure()', () => {
		Amplify.configure({ Auth: { Cognito: { identityPoolId: 'x' } } });
		expect(hasGlobalContext()).toBe(true);
	});

	it('the global context is branded', () => {
		Amplify.configure({});
		const ctx = getGlobalContext();
		expect(isAmplifyContext(ctx)).toBe(true);
	});

	it('the global context is frozen', () => {
		Amplify.configure({});
		const ctx = getGlobalContext();
		expect(Object.isFrozen(ctx)).toBe(true);
	});

	it('context.resourcesConfig matches Amplify.getConfig()', () => {
		const config = { Auth: { Cognito: { identityPoolId: 'test-pool' } } };
		Amplify.configure(config);
		const ctx = getGlobalContext();
		expect(ctx.resourcesConfig).toEqual(Amplify.getConfig());
	});

	it('reconfiguring replaces the global context', () => {
		Amplify.configure({ Auth: { Cognito: { identityPoolId: 'pool1' } } });
		const ctx1 = getGlobalContext();

		Amplify.configure({ Auth: { Cognito: { identityPoolId: 'pool2' } } });
		const ctx2 = getGlobalContext();

		expect(ctx1).not.toBe(ctx2);
	});

	it('context.fetchAuthSession delegates to Auth', async () => {
		const mockTokenProvider = {
			getTokens: jest.fn().mockResolvedValue({
				accessToken: { toString: () => 'token' },
			}),
		};

		Amplify.configure(
			{ Auth: { Cognito: { userPoolId: 'pool', userPoolClientId: 'client' } } },
			{ Auth: { tokenProvider: mockTokenProvider } },
		);

		const ctx = getGlobalContext();
		await ctx.fetchAuthSession();

		expect(mockTokenProvider.getTokens).toHaveBeenCalled();
	});

	it('context.clearCredentials delegates to Auth', async () => {
		const mockCredentialsProvider = {
			clearCredentialsAndIdentityId: jest.fn().mockResolvedValue(undefined),
			getCredentialsAndIdentityId: jest
				.fn()
				.mockResolvedValue({ credentials: {}, identityId: 'id' }),
		};

		Amplify.configure(
			{ Auth: { Cognito: { identityPoolId: 'pool' } } },
			{ Auth: { credentialsProvider: mockCredentialsProvider } },
		);

		const ctx = getGlobalContext();
		await ctx.clearCredentials();

		expect(
			mockCredentialsProvider.clearCredentialsAndIdentityId,
		).toHaveBeenCalled();
	});

	it('context.getTokens delegates to Auth', async () => {
		const mockTokenProvider = {
			getTokens: jest.fn().mockResolvedValue({
				accessToken: { toString: () => 'token' },
			}),
		};

		Amplify.configure(
			{ Auth: { Cognito: { userPoolId: 'pool', userPoolClientId: 'client' } } },
			{ Auth: { tokenProvider: mockTokenProvider } },
		);

		const ctx = getGlobalContext();
		await ctx.getTokens({});

		expect(mockTokenProvider.getTokens).toHaveBeenCalled();
	});
});
