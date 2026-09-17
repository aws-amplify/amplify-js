// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorageInterface, clearCredentials } from '@aws-amplify/core';
import { registerContextTokenOrchestrator } from '@aws-amplify/core/internals/utils';
import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import { signOut } from '../../../src/providers/cognito/apis/signOut';
import { DefaultTokenStore } from '../../../src/providers/cognito/tokenProvider/TokenStore';
import { TokenOrchestrator } from '../../../src/providers/cognito/tokenProvider/TokenOrchestrator';
import { tokenOrchestrator as globalTokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { refreshAuthTokensWithoutDedupe } from '../../../src/providers/cognito/utils/refreshAuthTokens';
import { DefaultOAuthStore } from '../../../src/providers/cognito/utils/signInWithRedirectStore';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	clearCredentials: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../src/providers/cognito/utils/signInWithRedirectStore');

const region = 'us-west-2';
const cognitoConfigWithOAuth = {
	userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
	userPoolId: `${region}_zzzzz`,
	identityPoolId: `${region}:xxxxxx`,
	loginWith: {
		oauth: {
			domain: 'hosted-ui.test',
			redirectSignIn: ['https://myapp.test/completeSignIn/'],
			redirectSignOut: ['https://myapp.test/completeSignOut/'],
			responseType: 'code' as const,
			scopes: [],
		},
	},
};

const createMemoryStorage = (): KeyValueStorageInterface => {
	const store = new Map<string, string>();

	return {
		setItem: async (key, value) => {
			store.set(key, value);
		},
		getItem: async key => store.get(key) ?? null,
		removeItem: async key => {
			store.delete(key);
		},
		clear: async () => {
			store.clear();
		},
	};
};

/**
 * Builds the write-capable per-context orchestrator exactly the way
 * `createUserPoolsTokenProvider` does for a local `AmplifyContext`.
 */
const createContextOrchestrator = (): TokenOrchestrator => {
	const authConfig = { Cognito: cognitoConfigWithOAuth };
	const tokenStore = new DefaultTokenStore();
	tokenStore.setAuthConfig(authConfig);
	tokenStore.setKeyValueStorage(createMemoryStorage());

	const orchestrator = new TokenOrchestrator();
	orchestrator.setAuthConfig(authConfig);
	orchestrator.setAuthTokenStore(tokenStore);
	orchestrator.setTokenRefresher(refreshAuthTokensWithoutDedupe);

	return orchestrator;
};

/**
 * Regression guard for the OAuth-configured local-context sign-out defect:
 * `signOut(ctx)` resolved the per-context orchestrator and threaded it into
 * `handleOAuthSignOut`, but `completeOAuthSignOut` reached past it and cleared
 * the module-level GLOBAL orchestrator plus the GLOBAL credentials. On a pool
 * that has OAuth configured, a user-pool sign-in through a local
 * `createAmplifyContext()` therefore persisted per-context while sign-out
 * cleared the (empty) global store — leaving the user signed in.
 *
 * Unlike `signOut.test.ts`, this suite deliberately does NOT mock the oauth
 * utils, so the real `handleOAuthSignOut` -> `completeOAuthSignOut` chain runs.
 */
describe('signOut token orchestrator resolution (OAuth-configured local context)', () => {
	const MockDefaultOAuthStore = DefaultOAuthStore as jest.Mock;
	const mockGlobalClearCredentials = jest.mocked(clearCredentials);

	let contextOrchestrator: TokenOrchestrator;
	let contextClearTokensSpy: jest.SpyInstance;
	let globalClearTokensSpy: jest.SpyInstance;
	let mockOAuthStoreInstance: {
		setAuthConfig: jest.Mock;
		loadOAuthSignIn: jest.Mock;
		clearOAuthData: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockOAuthStoreInstance = {
			setAuthConfig: jest.fn(),
			// Not an OAuth sign-in, so sign-out completes in-process instead of
			// redirecting to the Hosted UI logout endpoint.
			loadOAuthSignIn: jest.fn().mockResolvedValue({
				isOAuthSignIn: false,
				preferPrivateSession: false,
			}),
			clearOAuthData: jest.fn().mockResolvedValue(undefined),
		};
		MockDefaultOAuthStore.mockImplementation(() => mockOAuthStoreInstance);

		contextOrchestrator = createContextOrchestrator();
		contextClearTokensSpy = jest.spyOn(contextOrchestrator, 'clearTokens');
		globalClearTokensSpy = jest
			.spyOn(globalTokenOrchestrator, 'clearTokens')
			.mockResolvedValue(undefined);
	});

	afterEach(() => {
		contextClearTokensSpy.mockRestore();
		globalClearTokensSpy.mockRestore();
	});

	const createLocalCtx = () => {
		const tokenProvider = { getTokens: jest.fn() };
		registerContextTokenOrchestrator(tokenProvider, contextOrchestrator);

		return createMockAmplifyContext(
			{ Auth: { Cognito: cognitoConfigWithOAuth } },
			{ libraryOptions: { Auth: { tokenProvider } } },
		);
	};

	it('clears the per-context token store and the context credentials, not the global ones', async () => {
		const ctx = createLocalCtx();

		await signOut(ctx);

		expect(contextClearTokensSpy).toHaveBeenCalledTimes(1);
		expect(ctx.clearCredentials).toHaveBeenCalledTimes(1);
		expect(globalClearTokensSpy).not.toHaveBeenCalled();
		expect(mockGlobalClearCredentials).not.toHaveBeenCalled();
	});

	it('clears the OAuth data held by the store', async () => {
		await signOut(createLocalCtx());

		expect(mockOAuthStoreInstance.clearOAuthData).toHaveBeenCalledTimes(1);
	});
});
