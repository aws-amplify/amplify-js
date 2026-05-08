// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { deleteUserAttributes } from '../../../src/providers/cognito';
import { DeleteUserAttributesException } from '../../../src/providers/cognito/types/errors';
import { createDeleteUserAttributesClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

import { getMockError, mockAccessToken } from './testUtils/data';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

describe('deleteUserAttributes', () => {
	// assert mocks
	const mockDeleteUserAttributes = jest.fn();
	const mockCreateDeleteUserAttributesClient = jest.mocked(
		createDeleteUserAttributesClient,
	);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
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

	beforeAll(() => {
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockDeleteUserAttributes.mockResolvedValue({ $metadata: {} });
		mockCreateDeleteUserAttributesClient.mockReturnValueOnce(
			mockDeleteUserAttributes,
		);
	});

	afterEach(() => {
		mockDeleteUserAttributes.mockReset();
		(mockCtx.fetchAuthSession as jest.Mock).mockClear();
		mockCreateDeleteUserAttributesClient.mockClear();
	});

	it('should delete user attributes', async () => {
		expect.assertions(2);
		await deleteUserAttributes(mockCtx, {
			userAttributeKeys: ['given_name', 'address'],
		});
		expect(mockDeleteUserAttributes).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				UserAttributeNames: ['given_name', 'address'],
			}),
		);
		expect(mockDeleteUserAttributes).toHaveBeenCalledTimes(1);
	});

	it('invokes mockCreateCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
		const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
		const endpointCtx = createMockAmplifyContext({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});
		(endpointCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
		await deleteUserAttributes(endpointCtx, {
			userAttributeKeys: ['given_name', 'address'],
		});

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockDeleteUserAttributes.mockImplementation(() => {
			throw getMockError(
				DeleteUserAttributesException.InvalidParameterException,
			);
		});
		try {
			await deleteUserAttributes(mockCtx, {
				userAttributeKeys: ['address', 'given_name'],
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				DeleteUserAttributesException.InvalidParameterException,
			);
		}
	});
});
