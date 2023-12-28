// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	validateState,
	flowCancelledMessage,
	validationFailedMessage,
	validationRecoverySuggestion,
} from '../../../../../src/providers/cognito/utils/oauth/validateState';
import { oAuthStore } from '../../../../../src/providers/cognito/utils/oauth/oAuthStore';
import { OAuthStore } from '../../../../../src/providers/cognito/utils/types';
import { AuthError } from '../../../../../src/errors/AuthError';
import { AuthErrorTypes } from '../../../../../src/types/Auth';

jest.mock(
	'../../../../../src/providers/cognito/utils/oauth/oAuthStore',
	() => ({
		oAuthStore: {
			setAuthConfig: jest.fn(),
			storeOAuthInFlight: jest.fn(),
			storeOAuthState: jest.fn(),
			storePKCE: jest.fn(),
			loadOAuthInFlight: jest.fn(),
			loadOAuthSignIn: jest.fn(),
			storeOAuthSignIn: jest.fn(),
			loadOAuthState: jest.fn(),
			loadPKCE: jest.fn(),
			clearOAuthData: jest.fn(),
			clearOAuthInflightData: jest.fn(),
		} as OAuthStore,
	})
);

describe('validateState', () => {
	const mockLoadOAuthState = oAuthStore.loadOAuthState as jest.Mock;
	const expectedState = 'some_state_123';

	it('returns validated state', () => {
		mockLoadOAuthState.mockResolvedValueOnce(expectedState);

		expect(validateState(expectedState)).resolves.toEqual(expectedState);
	});

	it('throws exception when input state is null but oAuthStore has previous store state', () => {
		mockLoadOAuthState.mockResolvedValueOnce(expectedState);
		const expectError = new AuthError({
			name: AuthErrorTypes.OAuthSignInError,
			message: flowCancelledMessage,
		});
		expect(validateState(null)).rejects.toThrow(expectError);
	});

	it('throws exception when the input state is not the same as the state in oAuthStore', () => {
		mockLoadOAuthState.mockResolvedValueOnce(expectedState);
		const expectError = new AuthError({
			name: AuthErrorTypes.OAuthSignInError,
			message: validationFailedMessage,
			recoverySuggestion: validationRecoverySuggestion,
		});
		expect(validateState('different_state')).rejects.toThrow(expectError);
	});
});
