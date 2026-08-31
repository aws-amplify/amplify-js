// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';
import {
	clearGlobalContext,
	decodeJWT,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import {
	createCompleteWebAuthnRegistrationClient,
	createStartWebAuthnRegistrationClient,
} from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import {
	PasskeyError,
	PasskeyErrorCode,
} from '../../../src/client/utils/passkey/errors';
import { associateWebAuthnCredential } from '../../../src/client/apis/associateWebAuthnCredential';
import {
	passkeyCredentialCreateOptions,
	passkeyRegistrationResult,
} from '../../mockData';
import { serializePkcWithAttestationToJson } from '../../../src/client/utils/passkey/serde';
import * as utils from '../../../src/client/utils';
import { getIsPasskeySupported } from '../../../src/client/utils/passkey/getIsPasskeySupported';
import { mockAccessToken } from '../../providers/cognito/testUtils/data';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';
import {
	assertCredentialIsPkcWithAuthenticatorAssertionResponse,
	assertCredentialIsPkcWithAuthenticatorAttestationResponse,
} from '../../../src/client/utils/passkey/types';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

jest.mock('../../../src/client/utils/passkey/getIsPasskeySupported');
jest.mock('../../../src/client/utils/passkey/types', () => ({
	...jest.requireActual('../../../src/client/utils/passkey/types'),
	assertCredentialIsPkcWithAuthenticatorAssertionResponse: jest.fn(),
	assertCredentialIsPkcWithAuthenticatorAttestationResponse: jest.fn(),
}));

Object.assign(navigator, {
	credentials: {
		create: jest.fn(),
	},
});

describe('associateWebAuthnCredential', () => {
	const navigatorCredentialsCreateSpy = jest.spyOn(
		navigator.credentials,
		'create',
	);
	const registerPasskeySpy = jest.spyOn(utils, 'registerPasskey');

	const mockGetIsPasskeySupported = jest.mocked(getIsPasskeySupported);

	const mockStartWebAuthnRegistration = jest.fn();
	const mockCreateStartWebAuthnRegistrationClient = jest.mocked(
		createStartWebAuthnRegistrationClient,
	);

	const mockCompleteWebAuthnRegistration = jest.fn();
	const mockCreateCompleteWebAuthnRegistrationClient = jest.mocked(
		createCompleteWebAuthnRegistrationClient,
	);

	const mockAssertCredentialIsPkcWithAuthenticatorAssertionResponse =
		jest.mocked(assertCredentialIsPkcWithAuthenticatorAssertionResponse);
	const mockAssertCredentialIsPkcWithAuthenticatorAttestationResponse =
		jest.mocked(assertCredentialIsPkcWithAuthenticatorAttestationResponse);

	// Facade parity: configure ONLY the global AmplifyContext (with real config),
	// deliberately NOT the core `Amplify` singleton. This reproduces facade-only
	// configuration — the case older suites masked by configuring the singleton
	// directly — and proves the API resolves config + auth from the global context.
	const mockCtx = createMockAmplifyContext({
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	});
	const mockCtxFetchAuthSession = mockCtx.fetchAuthSession as jest.Mock;

	beforeAll(() => {
		setGlobalContext(mockCtx);
		mockCtxFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
		mockCreateStartWebAuthnRegistrationClient.mockReturnValue(
			mockStartWebAuthnRegistration,
		);
		mockCreateCompleteWebAuthnRegistrationClient.mockReturnValue(
			mockCompleteWebAuthnRegistration,
		);
		mockCompleteWebAuthnRegistration.mockImplementation(() => ({
			CredentialId: '12345',
		}));

		navigatorCredentialsCreateSpy.mockResolvedValue(passkeyRegistrationResult);

		mockGetIsPasskeySupported.mockReturnValue(true);
		mockAssertCredentialIsPkcWithAuthenticatorAssertionResponse.mockImplementation(
			() => undefined,
		);
		mockAssertCredentialIsPkcWithAuthenticatorAttestationResponse.mockImplementation(
			() => undefined,
		);
	});

	afterAll(() => {
		clearGlobalContext();
	});

	afterEach(() => {
		mockCtxFetchAuthSession.mockClear();
		mockStartWebAuthnRegistration.mockClear();
		navigatorCredentialsCreateSpy.mockClear();
	});

	it('resolves config from the global context under facade-only configuration (core singleton unconfigured)', async () => {
		// Guard: the core singleton must NOT hold the Cognito config in this
		// scenario — the API must still succeed by reading the global context.
		expect(Amplify.getConfig().Auth?.Cognito).toBeUndefined();

		mockStartWebAuthnRegistration.mockImplementation(() => ({
			CredentialCreationOptions: passkeyCredentialCreateOptions,
		}));

		await associateWebAuthnCredential();

		expect(mockCtxFetchAuthSession).toHaveBeenCalled();
		expect(mockStartWebAuthnRegistration).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
			},
		);
	});

	it('should pass the correct service options when retrieving credential creation options', async () => {
		mockStartWebAuthnRegistration.mockImplementation(() => ({
			CredentialCreationOptions: passkeyCredentialCreateOptions,
		}));

		await associateWebAuthnCredential();

		expect(mockStartWebAuthnRegistration).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
			},
		);
	});

	it('should pass the correct service options when verifying a credential', async () => {
		mockStartWebAuthnRegistration.mockImplementation(() => ({
			CredentialCreationOptions: passkeyCredentialCreateOptions,
		}));

		await associateWebAuthnCredential();

		expect(mockCompleteWebAuthnRegistration).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
				Credential: serializePkcWithAttestationToJson(
					passkeyRegistrationResult,
				),
			},
		);
	});

	it('should call the registerPasskey function with correct input', async () => {
		mockStartWebAuthnRegistration.mockImplementation(() => ({
			CredentialCreationOptions: passkeyCredentialCreateOptions,
		}));

		await associateWebAuthnCredential();

		expect(registerPasskeySpy).toHaveBeenCalledWith(
			passkeyCredentialCreateOptions,
		);

		expect(navigatorCredentialsCreateSpy).toHaveBeenCalled();
	});

	it('should throw an error when service returns empty credential creation options', async () => {
		expect.assertions(2);

		mockStartWebAuthnRegistration.mockImplementation(() => ({
			CredentialCreationOptions: undefined,
		}));

		try {
			await associateWebAuthnCredential();
		} catch (error: any) {
			expect(error).toBeInstanceOf(PasskeyError);
			expect(error.name).toBe(
				PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
			);
		}
	});

	it('should throw an error when passkeys are not supported', async () => {
		expect.assertions(2);

		mockStartWebAuthnRegistration.mockImplementation(() => ({
			CredentialCreationOptions: passkeyCredentialCreateOptions,
		}));

		mockGetIsPasskeySupported.mockReturnValue(false);

		try {
			await associateWebAuthnCredential();
		} catch (error: any) {
			expect(error).toBeInstanceOf(PasskeyError);
			expect(error.name).toBe(PasskeyErrorCode.PasskeyNotSupported);
		}
	});
});
