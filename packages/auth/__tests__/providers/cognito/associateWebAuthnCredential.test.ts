import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import {
	createGetWebAuthnRegistrationOptionsClient,
	createVerifyWebAuthnRegistrationResultClient,
} from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import {
	PasskeyError,
	PasskeyErrorCode,
} from '../../../src/utils/passkey/errors';
import { associateWebAuthnCredential } from '../../../src/providers/cognito/apis/associateWebAuthnCredential';
import {
	passkeyCredentialCreateOptions,
	passkeyRegistrationResult,
} from '../../mockData';
import { serializePkcToJson } from '../../../src/utils/passkey/serde';
import * as utils from '../../../src/utils';

import { setUpGetConfig } from './testUtils/setUpGetConfig';
import { mockAccessToken } from './testUtils/data';

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

	const mockGetWebAuthnRegistrationOptions = jest.fn();
	const mockCreateGetWebAuthnRegistrationOptionsClient = jest.mocked(
		createGetWebAuthnRegistrationOptionsClient,
	);

	const mockVerifyWebAuthnRegistrationResult = jest.fn();
	const mockCreateVerifyWebAuthnRegistrationResultClient = jest.mocked(
		createVerifyWebAuthnRegistrationResultClient,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
		mockCreateGetWebAuthnRegistrationOptionsClient.mockReturnValue(
			mockGetWebAuthnRegistrationOptions,
		);
		mockCreateVerifyWebAuthnRegistrationResultClient.mockReturnValue(
			mockVerifyWebAuthnRegistrationResult,
		);
		mockVerifyWebAuthnRegistrationResult.mockImplementation(() => ({
			CredentialId: '12345',
		}));

		navigatorCredentialsCreateSpy.mockResolvedValue(passkeyRegistrationResult);
	});

	afterEach(() => {
		mockFetchAuthSession.mockClear();
		mockGetWebAuthnRegistrationOptions.mockReset();
		navigatorCredentialsCreateSpy.mockClear();
	});

	it('should pass the correct service options when retrieving credential creation options', async () => {
		mockGetWebAuthnRegistrationOptions.mockImplementation(() => ({
			CredentialCreationOptions: passkeyCredentialCreateOptions,
		}));

		await associateWebAuthnCredential();

		expect(mockGetWebAuthnRegistrationOptions).toHaveBeenCalledWith(
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
		mockGetWebAuthnRegistrationOptions.mockImplementation(() => ({
			CredentialCreationOptions: passkeyCredentialCreateOptions,
		}));

		await associateWebAuthnCredential();

		expect(mockVerifyWebAuthnRegistrationResult).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
				Credential: JSON.stringify(
					serializePkcToJson(passkeyRegistrationResult),
				),
			},
		);
	});

	it('should call the registerPasskey function with correct input', async () => {
		mockGetWebAuthnRegistrationOptions.mockImplementation(() => ({
			CredentialCreationOptions: passkeyCredentialCreateOptions,
		}));

		await associateWebAuthnCredential();

		expect(registerPasskeySpy).toHaveBeenCalledWith(
			JSON.parse(passkeyCredentialCreateOptions),
		);

		expect(navigatorCredentialsCreateSpy).toHaveBeenCalled();
	});

	it('should throw an error when service returns empty credential creation options', async () => {
		expect.assertions(2);

		mockGetWebAuthnRegistrationOptions.mockImplementation(() => ({
			CredentialCreationOptions: undefined,
		}));

		try {
			await associateWebAuthnCredential();
		} catch (error: any) {
			expect(error).toBeInstanceOf(PasskeyError);
			expect(error.name).toBe(
				PasskeyErrorCode.InvalidCredentialCreationOptions,
			);
		}
	});
});
