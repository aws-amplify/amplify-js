import { Amplify } from '@aws-amplify/core';

import { signInStore } from '../../../../../src/client/utils/store';
import { authAPITestParams } from '../../testUtils/authApiTestParams';
import { setUpGetConfig } from '../../testUtils/setUpGetConfig';
import { createRespondToAuthChallengeClient } from '../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { handleWebAuthnSignInResult } from '../../../../../src/client/flows/userAuth/handleWebAuthnSignInResult';
import {
	passkeyCredentialRequestOptions,
	passkeyGetResult,
	passkeyGetResultJson,
} from '../../../../mockData';
import { AuthError } from '../../../../../src/errors/AuthError';
import { AuthErrorCodes } from '../../../../../src/common/AuthErrorStrings';
import { cacheCognitoTokens } from '../../../../../src/providers/cognito/tokenProvider/cacheTokens';
import { dispatchSignedInHubEvent } from '../../../../../src/providers/cognito/utils/dispatchSignedInHubEvent';
import { getIsPasskeySupported } from '../../../../../src/client/utils/passkey/getIsPasskeySupported';
import {
	assertCredentialIsPkcWithAuthenticatorAssertionResponse,
	assertCredentialIsPkcWithAuthenticatorAttestationResponse,
} from '../../../../../src/client/utils/passkey/types';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('../../../../../src/client/utils/store');
jest.mock(
	'../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../../../src/providers/cognito/factories');
jest.mock('../../../../../src/providers/cognito/tokenProvider/cacheTokens');
jest.mock(
	'../../../../../src/providers/cognito/utils/dispatchSignedInHubEvent',
);
jest.mock('../../../../../src/client/utils/passkey/getIsPasskeySupported');
jest.mock('../../../../../src/client/utils/passkey/types');

Object.assign(navigator, {
	credentials: {
		get: jest.fn(),
	},
});
describe('handleWebAuthnSignInResult', () => {
	const navigatorCredentialsGetSpy = jest.spyOn(navigator.credentials, 'get');
	const mockStoreGetState = jest.mocked(signInStore.getState);
	const mockRespondToAuthChallenge = jest.fn();
	const mockCreateRespondToAuthChallengeClient = jest.mocked(
		createRespondToAuthChallengeClient,
	);
	const mockGetIsPasskeySupported = jest.mocked(getIsPasskeySupported);

	const mockCacheCognitoTokens = jest.mocked(cacheCognitoTokens);
	const mockDispatchSignedInHubEvent = jest.mocked(dispatchSignedInHubEvent);

	const challengeName = 'WEB_AUTHN';
	const signInSession = '123456';
	const { username } = authAPITestParams.user1;
	const challengeParameters: Record<string, string> = {
		CREDENTIAL_REQUEST_OPTIONS: passkeyCredentialRequestOptions,
	};

	const mockAssertCredentialIsPkcWithAuthenticatorAssertionResponse =
		jest.mocked(assertCredentialIsPkcWithAuthenticatorAssertionResponse);
	const mockAssertCredentialIsPkcWithAuthenticatorAttestationResponse =
		jest.mocked(assertCredentialIsPkcWithAuthenticatorAttestationResponse);

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockGetIsPasskeySupported.mockReturnValue(true);
		mockAssertCredentialIsPkcWithAuthenticatorAssertionResponse.mockImplementation(
			() => undefined,
		);
		mockAssertCredentialIsPkcWithAuthenticatorAttestationResponse.mockImplementation(
			() => undefined,
		);
	});

	beforeEach(() => {
		mockCreateRespondToAuthChallengeClient.mockReturnValueOnce(
			mockRespondToAuthChallenge,
		);
		navigatorCredentialsGetSpy.mockResolvedValue(passkeyGetResult);
	});

	afterEach(() => {
		mockRespondToAuthChallenge.mockReset();
		mockCreateRespondToAuthChallengeClient.mockClear();
	});

	it('should throw an error when username is not available in state', async () => {
		mockStoreGetState.mockReturnValue({
			challengeName,
			signInSession,
		});
		expect.assertions(2);
		try {
			await handleWebAuthnSignInResult(challengeParameters);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthErrorCodes.SignInException);
		}
	});
	it('should throw an error when CREDENTIAL_REQUEST_OPTIONS is empty', async () => {
		expect.assertions(2);
		try {
			await handleWebAuthnSignInResult({});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthErrorCodes.SignInException);
		}
	});

	it('should throw an error when challenge name is not WEB_AUTHN', async () => {
		mockStoreGetState.mockReturnValue({
			signInSession,
			username,
			challengeName: 'SMS_MFA',
		});
		expect.assertions(2);
		try {
			await handleWebAuthnSignInResult(challengeParameters);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthErrorCodes.SignInException);
		}
	});

	it('should call RespondToAuthChallenge with correct values', async () => {
		mockStoreGetState.mockReturnValue({
			username,
			challengeName,
			signInSession,
		});
		try {
			await handleWebAuthnSignInResult(challengeParameters);
		} catch (error: any) {
			// __ we don't care about this error
		}
		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				ChallengeName: 'WEB_AUTHN',
				ChallengeResponses: {
					USERNAME: username,
					CREDENTIAL: JSON.stringify(passkeyGetResultJson),
				},
				ClientId: expect.any(String),
				Session: signInSession,
			},
		);
	});

	it('should return nextStep DONE after authentication', async () => {
		mockStoreGetState.mockReturnValue({
			username,
			challengeName,
			signInSession,
		});
		mockRespondToAuthChallenge.mockResolvedValue(
			authAPITestParams.RespondToAuthChallengeCommandOutput,
		);
		mockCacheCognitoTokens.mockResolvedValue(undefined);
		mockDispatchSignedInHubEvent.mockResolvedValue(undefined);

		const result = await handleWebAuthnSignInResult(challengeParameters);

		expect(result.isSignedIn).toBe(true);
		expect(result.nextStep.signInStep).toBe('DONE');
	});
});
