import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

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
import { setUpGetConfig } from '../../providers/cognito/testUtils/setUpGetConfig';
import { mockAccessToken } from '../../providers/cognito/testUtils/data';
import {
	assertCredentialIsPkcWithAuthenticatorAssertionResponse,
	assertCredentialIsPkcWithAuthenticatorAttestationResponse,
} from '../../../src/client/utils/passkey/types';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
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

	const mockFetchAuthSession = jest.mocked(fetchAuthSession);

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

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
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

	afterEach(() => {
		mockFetchAuthSession.mockClear();
		mockStartWebAuthnRegistration.mockClear();
		navigatorCredentialsCreateSpy.mockClear();
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
