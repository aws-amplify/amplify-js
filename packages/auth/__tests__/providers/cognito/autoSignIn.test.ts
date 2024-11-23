// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from 'aws-amplify';

import {
	cognitoUserPoolsTokenProvider,
	confirmSignUp,
	signUp,
} from '../../../src/providers/cognito';
import {
	autoSignIn,
	resetAutoSignIn,
} from '../../../src/providers/cognito/apis/autoSignIn';
import * as initiateAuthHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import {
	createConfirmSignUpClient,
	createSignUpClient,
} from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { RespondToAuthChallengeCommandOutput } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { autoSignInStore } from '../../../src/client/utils/store';
import { AuthError } from '../../../src';
import { cacheCognitoTokens } from '../../../src/providers/cognito/tokenProvider/cacheTokens';
import { dispatchSignedInHubEvent } from '../../../src/providers/cognito/utils/dispatchSignedInHubEvent';
import { handleUserAuthFlow } from '../../../src/client/flows/userAuth/handleUserAuthFlow';
import { AUTO_SIGN_IN_EXCEPTION } from '../../../src/errors/constants';

import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('../../../src/providers/cognito/utils/dispatchSignedInHubEvent');
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/tokenProvider/cacheTokens');
jest.mock('../../../src/providers/cognito/utils/dispatchSignedInHubEvent');
jest.mock('../../../src/client/flows/userAuth/handleUserAuthFlow');

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};
cognitoUserPoolsTokenProvider.setAuthConfig(authConfig);
Amplify.configure({
	Auth: authConfig,
});

const { user1 } = authAPITestParams;

describe('autoSignIn()', () => {
	const mockSignUp = jest.fn();
	const mockCreateSignUpClient = jest.mocked(createSignUpClient);

	const mockConfirmSignUp = jest.fn();
	const mockCreateConfirmSignUpClient = jest.mocked(createConfirmSignUpClient);

	const mockCacheCognitoTokens = jest.mocked(cacheCognitoTokens);
	const mockDispatchSignedInHubEvent = jest.mocked(dispatchSignedInHubEvent);

	const handleUserSRPAuthFlowSpy = jest
		.spyOn(initiateAuthHelpers, 'handleUserSRPAuthFlow')
		.mockImplementationOnce(
			async (): Promise<RespondToAuthChallengeCommandOutput> =>
				authAPITestParams.RespondToAuthChallengeCommandOutput,
		);

	const mockHandleUserAuthFlow = jest.mocked(handleUserAuthFlow);
	// to get around debounce on autoSignIn() APIs
	jest.useFakeTimers();

	describe('handleUserSRPAuthFlow', () => {
		beforeEach(() => {
			mockCreateSignUpClient.mockReturnValueOnce(mockSignUp);
			mockSignUp.mockReturnValueOnce({ UserConfirmed: true });
		});

		afterEach(() => {
			mockSignUp.mockClear();
			mockCreateSignUpClient.mockClear();
			handleUserSRPAuthFlowSpy.mockClear();

			resetAutoSignIn();
		});

		afterAll(() => {
			mockSignUp.mockReset();
			mockCreateSignUpClient.mockReset();
			handleUserSRPAuthFlowSpy.mockReset();
			jest.runAllTimers();
		});

		it('autoSignIn() should throw an error when not enabled', async () => {
			expect(autoSignInStore.getState()).toMatchObject({ active: false });
			expect(autoSignIn()).rejects.toThrow(
				new AuthError({
					name: AUTO_SIGN_IN_EXCEPTION,
					message:
						'The autoSignIn flow has not started, or has been cancelled/completed.',
				}),
			);
		});

		it('signUp should enable autoSignIn and return COMPLETE_AUTO_SIGN_IN step', async () => {
			expect(autoSignInStore.getState()).toMatchObject({ active: false });
			const resp = await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
					autoSignIn: true,
				},
			});
			expect(resp).toEqual({
				isSignUpComplete: true,
				nextStep: {
					signUpStep: 'COMPLETE_AUTO_SIGN_IN',
				},
			});
			expect(mockSignUp).toHaveBeenCalledTimes(1);
			expect(autoSignInStore.getState().username).toBe(user1.username);
		});

		it('autoSignIn() should resolve to a SignInOutput', async () => {
			expect(autoSignInStore.getState()).toMatchObject({ active: false });
			await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
					autoSignIn: true,
				},
			});
			const signInOutput = await autoSignIn();
			expect(signInOutput).toEqual(authAPITestParams.signInResult());
			expect(handleUserSRPAuthFlowSpy).toHaveBeenCalledTimes(1);
			expect(autoSignInStore.getState()).toMatchObject({ active: false });
		});
	});

	describe('handleUserAuthFlow', () => {
		beforeEach(() => {
			mockCreateSignUpClient.mockReturnValueOnce(mockSignUp);
			mockSignUp.mockReturnValueOnce({ UserConfirmed: false });

			mockCreateConfirmSignUpClient.mockReturnValueOnce(mockConfirmSignUp);
			mockConfirmSignUp.mockReturnValueOnce({ Session: 'ASDFGHJKL' });

			mockHandleUserAuthFlow.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> =>
					authAPITestParams.RespondToAuthChallengeCommandOutput,
			);
		});

		afterEach(() => {
			mockSignUp.mockClear();
			mockConfirmSignUp.mockClear();
			mockCreateSignUpClient.mockClear();
			mockHandleUserAuthFlow.mockClear();
			mockCreateConfirmSignUpClient.mockClear();

			resetAutoSignIn();
		});

		afterAll(() => {
			mockSignUp.mockReset();
			mockConfirmSignUp.mockReset();
			mockCreateSignUpClient.mockReset();
			mockCreateConfirmSignUpClient.mockReset();
			mockHandleUserAuthFlow.mockReset();
			jest.runAllTimers();
		});

		it('autoSignIn() should throw an error when not enabled', async () => {
			expect(autoSignIn()).rejects.toThrow(
				new AuthError({
					name: AUTO_SIGN_IN_EXCEPTION,
					message:
						'The autoSignIn flow has not started, or has been cancelled/completed.',
				}),
			);
		});

		it('signUp() should begin autoSignIn flow and return CONFIRM_SIGN_UP next step', async () => {
			expect(autoSignInStore.getState()).toMatchObject({ active: false });

			const signUpResult = await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
					autoSignIn: {
						authFlowType: 'USER_AUTH',
					},
				},
			});

			expect(signUpResult.nextStep.signUpStep).toBe('CONFIRM_SIGN_UP');
			expect(mockSignUp).toHaveBeenCalledTimes(1);
			expect(autoSignInStore.getState()).toMatchObject({
				active: true,
				username: user1.username,
			});
		});

		it('signUp() & confirmSignUp() should populate autoSignIn flow state and return COMPLETE_AUTO_SIGN_IN next step', async () => {
			expect(autoSignInStore.getState()).toMatchObject({ active: false });

			await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
					autoSignIn: {
						authFlowType: 'USER_AUTH',
					},
				},
			});

			const confirmSignUpResult = await confirmSignUp({
				username: user1.username,
				confirmationCode: '123456',
			});

			expect(confirmSignUpResult.nextStep.signUpStep).toBe(
				'COMPLETE_AUTO_SIGN_IN',
			);
			expect(autoSignInStore.getState()).toMatchObject({
				active: true,
				username: user1.username,
				session: 'ASDFGHJKL',
			});
		});

		it('autoSignIn() should resolve to SignInOutput', async () => {
			mockCacheCognitoTokens.mockResolvedValue(undefined);
			mockDispatchSignedInHubEvent.mockResolvedValue(undefined);

			expect(autoSignInStore.getState()).toMatchObject({ active: false });

			await signUp({
				username: user1.username,
				password: user1.password,
				options: {
					userAttributes: { email: user1.email },
					autoSignIn: {
						authFlowType: 'USER_AUTH',
					},
				},
			});

			await confirmSignUp({
				username: user1.username,
				confirmationCode: '123456',
			});

			expect(autoSignInStore.getState()).toMatchObject({
				active: true,
				username: user1.username,
				session: 'ASDFGHJKL',
			});

			const autoSignInResult = await autoSignIn();

			expect(mockHandleUserAuthFlow).toHaveBeenCalledTimes(1);
			expect(mockHandleUserAuthFlow).toHaveBeenCalledWith(
				expect.objectContaining({
					username: user1.username,
					session: 'ASDFGHJKL',
				}),
			);
			expect(autoSignInResult.isSignedIn).toBe(true);
			expect(autoSignInResult.nextStep.signInStep).toBe('DONE');
			expect(autoSignInStore.getState()).toMatchObject({ active: false });
		});
	});
});
