// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DefaultTokenStore,
	TokenOrchestrator,
	createAuthSessionSwitcher,
	refreshAuthTokensWithoutDedupe,
} from '@aws-amplify/auth/cognito';
import { AuthConfig, KeyValueStorageInterface } from '@aws-amplify/core';

import { createUserPoolsTokenProvider } from '../../../../src/adapter-core';

jest.mock('@aws-amplify/auth/cognito');

const mockKeyValueStorage: KeyValueStorageInterface = {
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};
const mockAuthConfig: AuthConfig = {
	Cognito: {
		identityPoolId: '123',
		userPoolId: 'abc',
		userPoolClientId: 'def',
	},
};
const MockDefaultTokenStore = DefaultTokenStore as jest.Mock;
const MockTokenOrchestrator = TokenOrchestrator as jest.Mock;
const mockRefreshAuthTokens = refreshAuthTokensWithoutDedupe as jest.Mock;
const mockCreateAuthSessionSwitcher = createAuthSessionSwitcher as jest.Mock;
const mockSwitcher = {
	listSessionUsernames: jest.fn(),
	getStoredIdToken: jest.fn(),
	setActiveSession: jest.fn(),
};

describe('createUserPoolsTokenProvider', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		mockCreateAuthSessionSwitcher.mockReturnValue(mockSwitcher);
	});

	it('should create a token provider with underlying dependencies', () => {
		const tokenProvider = createUserPoolsTokenProvider(
			mockAuthConfig,
			mockKeyValueStorage,
		);

		expect(MockDefaultTokenStore).toHaveBeenCalledTimes(1);
		const mockTokenStoreInstance = MockDefaultTokenStore.mock.instances[0];
		expect(mockTokenStoreInstance.setAuthConfig).toHaveBeenCalledWith(
			mockAuthConfig,
		);
		expect(mockTokenStoreInstance.setKeyValueStorage).toHaveBeenCalledWith(
			mockKeyValueStorage,
		);

		expect(MockTokenOrchestrator).toHaveBeenCalledTimes(1);
		const mockTokenOrchestratorInstance =
			MockTokenOrchestrator.mock.instances[0];
		expect(mockTokenOrchestratorInstance.setAuthConfig).toHaveBeenCalledWith(
			mockAuthConfig,
		);
		expect(
			mockTokenOrchestratorInstance.setAuthTokenStore,
		).toHaveBeenCalledWith(mockTokenStoreInstance);
		expect(
			mockTokenOrchestratorInstance.setTokenRefresher,
		).toHaveBeenCalledWith(mockRefreshAuthTokens);

		expect(tokenProvider).toBeDefined();
	});

	it('surfaces a non-destructive session switcher and no destructive store methods', () => {
		const tokenProvider = createUserPoolsTokenProvider(
			mockAuthConfig,
			mockKeyValueStorage,
		);
		const mockTokenStoreInstance = MockDefaultTokenStore.mock.instances[0];

		// the switcher is built from the closure's DefaultTokenStore.
		expect(mockCreateAuthSessionSwitcher).toHaveBeenCalledWith(
			mockTokenStoreInstance,
		);
		expect(tokenProvider.getSessionSwitcher()).toBe(mockSwitcher);

		// ONLY read + reorder cross the boundary: no raw store, no destructive op.
		expect(Object.keys(tokenProvider).sort()).toEqual([
			'getSessionSwitcher',
			'getTokens',
		]);
		expect('storeTokens' in tokenProvider).toBe(false);
		expect('clearTokens' in tokenProvider).toBe(false);
		expect('clearTokensForUser' in tokenProvider).toBe(false);
		expect('removeSession' in tokenProvider).toBe(false);
	});

	it('should call TokenOrchestrator.getTokens method with the default forceRefresh value', async () => {
		const tokenProvider = createUserPoolsTokenProvider(
			mockAuthConfig,
			mockKeyValueStorage,
		);
		const mockTokenOrchestratorInstance =
			MockTokenOrchestrator.mock.instances[0];

		await tokenProvider.getTokens();
		expect(mockTokenOrchestratorInstance.getTokens).toHaveBeenCalledTimes(1);
		expect(mockTokenOrchestratorInstance.getTokens).toHaveBeenLastCalledWith({
			forceRefresh: false,
		});
	});

	it('should call TokenOrchestrator.getTokens method with the specified forceRefresh value', async () => {
		const tokenProvider = createUserPoolsTokenProvider(
			mockAuthConfig,
			mockKeyValueStorage,
		);
		const mockTokenOrchestratorInstance =
			MockTokenOrchestrator.mock.instances[0];

		await tokenProvider.getTokens({ forceRefresh: true });
		expect(mockTokenOrchestratorInstance.getTokens).toHaveBeenCalledTimes(1);
		expect(mockTokenOrchestratorInstance.getTokens).toHaveBeenLastCalledWith({
			forceRefresh: true,
		});
	});
});
