import { Amplify } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { createDeleteWebAuthnCredentialClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { DeleteWebAuthnCredentialInput } from '../../../src';
import { setUpGetConfig } from '../../providers/cognito/testUtils/setUpGetConfig';
import { mockAccessToken } from '../../providers/cognito/testUtils/data';
import { deleteWebAuthnCredential } from '../../../src/foundation/apis';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: {
		getConfig: jest.fn(),
		Auth: {
			fetchAuthSession: jest.fn(() => ({
				tokens: { accessToken: decodeJWT(mockAccessToken) },
			})),
		},
	},
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
	const mockDeleteWebAuthnCredential = jest.fn();
	const mockCreateDeleteWebAuthnCredentialClient = jest.mocked(
		createDeleteWebAuthnCredentialClient,
	);

	const mockCtx = createMockAmplifyContext({
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	});
	// Override fetchAuthSession to return the mock access token
	(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
		tokens: { accessToken: decodeJWT(mockAccessToken) },
	});

	beforeAll(() => {
		setUpGetConfig(Amplify);

		mockCreateDeleteWebAuthnCredentialClient.mockReturnValue(
			mockDeleteWebAuthnCredential,
		);
	});

	it('should pass correct service options when deleting a credential', async () => {
		const input: DeleteWebAuthnCredentialInput = {
			credentialId: 'dummyId',
		};

		await deleteWebAuthnCredential(mockCtx, input);

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
