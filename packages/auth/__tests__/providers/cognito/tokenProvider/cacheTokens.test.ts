// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { cacheCognitoTokens } from '../../../../src/providers/cognito/tokenProvider/cacheTokens';
import { tokenOrchestrator as globalTokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider/tokenProvider';
import { TokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider/TokenOrchestrator';

// Mock the global singleton module so we can spy on the fallback orchestrator.
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

	it('writes to the orchestrator passed by the caller', async () => {
		const orchestrator = {
			setTokens: jest.fn(),
		} as unknown as TokenOrchestrator;

		await cacheCognitoTokens(AuthenticationResult, orchestrator);

		expect(orchestrator.setTokens).toHaveBeenCalledTimes(1);
		expect(mockGlobalSetTokens).not.toHaveBeenCalled();
	});

	it('falls back to the global singleton orchestrator when none is passed', async () => {
		await cacheCognitoTokens(AuthenticationResult);

		expect(mockGlobalSetTokens).toHaveBeenCalledTimes(1);
	});

	it('throws InvalidTokens when there is no access token', async () => {
		const orchestrator = {
			setTokens: jest.fn(),
		} as unknown as TokenOrchestrator;

		await expect(
			cacheCognitoTokens({ username: 'username' }, orchestrator),
		).rejects.toThrow('Invalid tokens');
		expect(orchestrator.setTokens).not.toHaveBeenCalled();
	});
});
