// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { cacheCognitoTokens } from '../../../../src/providers/cognito/tokenProvider/cacheTokens';
import { tokenOrchestrator as globalTokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider/tokenProvider';
import { registerContextTokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider/contextTokenOrchestrators';
import { AuthTokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider/types';

// Mock the global singleton module so we can spy on the fallback orchestrator
// without touching the per-context registry (which we exercise for real).
jest.mock(
	'../../../../src/providers/cognito/tokenProvider/tokenProvider',
	() => ({
		tokenOrchestrator: {
			setTokens: jest.fn(),
		},
	}),
);

// decodeJWT is exercised elsewhere; here we only care about token routing, so
// stub it to avoid needing a real signed JWT.
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	decodeJWT: jest.fn(),
}));

const mockDecodeJWT = jest.mocked(decodeJWT);
const mockGlobalSetTokens = jest.mocked(globalTokenOrchestrator.setTokens);

const AuthenticationResult = {
	AccessToken: 'accessTokenValue',
	username: 'username',
};

describe('cacheCognitoTokens', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockDecodeJWT.mockReturnValue({
			payload: { iat: 1710000000 },
		} as ReturnType<typeof decodeJWT>);
	});

	it('writes to the ctx orchestrator when the ctx token provider is registered', async () => {
		const contextOrchestrator = {
			setTokens: jest.fn(),
		} as unknown as AuthTokenOrchestrator;
		const tokenProvider = { getTokens: jest.fn() };
		registerContextTokenOrchestrator(tokenProvider, contextOrchestrator);

		const ctx = {
			libraryOptions: { Auth: { tokenProvider } },
		} as unknown as AmplifyContext;

		await cacheCognitoTokens(AuthenticationResult, ctx);

		expect(contextOrchestrator.setTokens).toHaveBeenCalledTimes(1);
		expect(mockGlobalSetTokens).not.toHaveBeenCalled();
	});

	it('falls back to the global singleton orchestrator when no ctx is provided', async () => {
		await cacheCognitoTokens(AuthenticationResult);

		expect(mockGlobalSetTokens).toHaveBeenCalledTimes(1);
	});

	it('falls back to the global singleton when the ctx provider is not registered', async () => {
		const ctx = {
			libraryOptions: { Auth: { tokenProvider: { getTokens: jest.fn() } } },
		} as unknown as AmplifyContext;

		await cacheCognitoTokens(AuthenticationResult, ctx);

		expect(mockGlobalSetTokens).toHaveBeenCalledTimes(1);
	});
});
