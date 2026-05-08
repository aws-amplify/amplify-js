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
import { mockAccessToken } from '../../providers/cognito/testUtils/data';
import {
	assertCredentialIsPkcWithAuthenticatorAssertionResponse,
	assertCredentialIsPkcWithAuthenticatorAttestationResponse,
} from '../../../src/client/utils/passkey/types';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

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

	const mockCtx = createMockAmplifyContext({
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	});

	beforeAll(() => {
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
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
		(mockCtx.fetchAuthSession as jest.Mock).mockClear();
		mockStartWebAuthnRegistration.mockClear();
		navigatorCredentialsCreateSpy.mockClear();
	});

	it('should pass the correct service options when retrieving credential creation options', async () => {
		mockStartWebAuthnRegistration.mockImplementation(() => ({
			CredentialCreationOptions: passkeyCredentialCreateOptions,
		}));

		await associateWebAuthnCredential(mockCtx);

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

		await associateWebAuthnCredential(mockCtx);

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

		await associateWebAuthnCredential(mockCtx);

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
			await associateWebAuthnCredential(mockCtx);
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
			await associateWebAuthnCredential(mockCtx);
		} catch (error: any) {
			expect(error).toBeInstanceOf(PasskeyError);
			expect(error.name).toBe(PasskeyErrorCode.PasskeyNotSupported);
		}
	});
});
