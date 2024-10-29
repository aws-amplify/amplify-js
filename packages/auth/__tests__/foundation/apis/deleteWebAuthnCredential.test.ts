import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { createDeleteWebAuthnCredentialClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import {
	DeleteWebAuthnCredentialInput,
	deleteWebAuthnCredential,
} from '../../../src/';
import { setUpGetConfig } from '../../providers/cognito/testUtils/setUpGetConfig';
import { mockAccessToken } from '../../providers/cognito/testUtils/data';

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

describe('deleteWebAuthnCredential', () => {
	const mockFetchAuthSession = jest.mocked(fetchAuthSession);

	const mockDeleteWebAuthnCredential = jest.fn();
	const mockCreateDeleteWebAuthnCredentialClient = jest.mocked(
		createDeleteWebAuthnCredentialClient,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
		mockCreateDeleteWebAuthnCredentialClient.mockReturnValue(
			mockDeleteWebAuthnCredential,
		);
	});

	afterEach(() => {
		mockFetchAuthSession.mockClear();
	});

	it('should pass correct service options when deleting a credential', async () => {
		const input: DeleteWebAuthnCredentialInput = {
			credentialId: 'dummyId',
		};

		await deleteWebAuthnCredential(input);

		expect(mockDeleteWebAuthnCredential).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockAccessToken,
				CredentialId: input.credentialId,
			},
		);
	});
});
