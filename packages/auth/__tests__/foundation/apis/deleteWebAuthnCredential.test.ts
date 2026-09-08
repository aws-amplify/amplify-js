// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import {
	createMockAmplifyContext,
	withTokens,
} from '@aws-amplify/core/internals/testing';

import { createDeleteWebAuthnCredentialClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { DeleteWebAuthnCredentialInput } from '../../../src';
import { mockAccessToken } from '../../providers/cognito/testUtils/data';
import { deleteWebAuthnCredential } from '../../../src/foundation/apis';

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

	// Real Cognito resources config supplied via an AmplifyContext (foundation
	// fns resolve config + auth from the passed context, not the core singleton).
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
		withTokens(mockCtx, decodeJWT(mockAccessToken));

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
