// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { updateUserAttributes } from '../../../src/providers/cognito';
import { UpdateUserAttributesException } from '../../../src/providers/cognito/types/errors';
import { toAttributeType } from '../../../src/providers/cognito/utils/apiHelpers';
import { createUpdateUserAttributesClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';

import { getMockError, mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

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

describe('updateUserAttributes', () => {
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockUpdateUserAttributes = jest.fn();
	const mockCreateUpdateUserAttributesClient = jest.mocked(
		createUpdateUserAttributesClient,
	);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockUpdateUserAttributes.mockResolvedValue({
			CodeDeliveryDetailsList: [
				{
					AttributeName: 'email',
					DeliveryMedium: 'EMAIL',
					Destination: 'mockedEmail',
				},
				{
					AttributeName: 'phone_number',
					DeliveryMedium: 'SMS',
					Destination: 'mockedPhoneNumber',
				},
			],
		});
		mockCreateUpdateUserAttributesClient.mockReturnValueOnce(
			mockUpdateUserAttributes,
		);
	});

	afterEach(() => {
		mockUpdateUserAttributes.mockReset();
		mockFetchAuthSession.mockClear();
		mockCreateUpdateUserAttributesClient.mockClear();
	});

	it('should return a map with updated and not updated attributes', async () => {
		const userAttributes = {
			address: 'mockedAddress',
			name: 'mockedName',
			email: 'mockedEmail',
			phone_number: 'mockedPhoneNumber',
		};
		const result = await updateUserAttributes({
			userAttributes,
			options: {
				clientMetadata: { foo: 'bar' },
			},
		});

		expect(result.address).toEqual({
			isUpdated: true,
			nextStep: {
				updateAttributeStep: 'DONE',
			},
		});

		expect(result.name).toEqual({
			isUpdated: true,
			nextStep: {
				updateAttributeStep: 'DONE',
			},
		});

		expect(result.email).toEqual({
			isUpdated: false,
			nextStep: {
				updateAttributeStep: 'CONFIRM_ATTRIBUTE_WITH_CODE',
				codeDeliveryDetails: {
					attributeName: 'email',
					deliveryMedium: 'EMAIL',
					destination: 'mockedEmail',
				},
			},
		});

		expect(result.phone_number).toEqual({
			isUpdated: false,
			nextStep: {
				updateAttributeStep: 'CONFIRM_ATTRIBUTE_WITH_CODE',
				codeDeliveryDetails: {
					attributeName: 'phone_number',
					deliveryMedium: 'SMS',
					destination: 'mockedPhoneNumber',
				},
			},
		});

		expect(mockUpdateUserAttributes).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				UserAttributes: toAttributeType(userAttributes),
				ClientMetadata: { foo: 'bar' },
			}),
		);
	});

	it('invokes mockCreateCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
		const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
		jest.mocked(Amplify.getConfig).mockReturnValueOnce({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});
		await updateUserAttributes({
			userAttributes: {},
			options: {
				clientMetadata: { foo: 'bar' },
			},
		});

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('updateUserAttributes API should return a map with updated attributes only', async () => {
		mockUpdateUserAttributes.mockResolvedValue({});
		const userAttributes = {
			address: 'mockedAddress',
			name: 'mockedName',
		};
		const result = await updateUserAttributes({
			userAttributes,
			options: {
				clientMetadata: { foo: 'bar' },
			},
		});

		expect(result.address).toEqual({
			isUpdated: true,
			nextStep: {
				updateAttributeStep: 'DONE',
			},
		});

		expect(result.name).toEqual({
			isUpdated: true,
			nextStep: {
				updateAttributeStep: 'DONE',
			},
		});

		expect(mockUpdateUserAttributes).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				UserAttributes: toAttributeType(userAttributes),
				ClientMetadata: { foo: 'bar' },
			}),
		);
	});

	it('updateUserAttributes API should return a map with not updated attributes only', async () => {
		mockUpdateUserAttributes.mockResolvedValue({
			CodeDeliveryDetailsList: [
				{
					AttributeName: 'email',
					DeliveryMedium: 'EMAIL',
					Destination: 'mockedEmail',
				},
				{
					AttributeName: 'phone_number',
					DeliveryMedium: 'SMS',
					Destination: 'mockedPhoneNumber',
				},
			],
		});
		const userAttributes = {
			email: 'mockedEmail',
			phone_number: 'mockedPhoneNumber',
		};
		const result = await updateUserAttributes({
			userAttributes,
			options: {
				clientMetadata: { foo: 'bar' },
			},
		});

		expect(result.email).toEqual({
			isUpdated: false,
			nextStep: {
				updateAttributeStep: 'CONFIRM_ATTRIBUTE_WITH_CODE',
				codeDeliveryDetails: {
					attributeName: 'email',
					deliveryMedium: 'EMAIL',
					destination: 'mockedEmail',
				},
			},
		});

		expect(result.phone_number).toEqual({
			isUpdated: false,
			nextStep: {
				updateAttributeStep: 'CONFIRM_ATTRIBUTE_WITH_CODE',
				codeDeliveryDetails: {
					attributeName: 'phone_number',
					deliveryMedium: 'SMS',
					destination: 'mockedPhoneNumber',
				},
			},
		});

		expect(mockUpdateUserAttributes).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockAccessToken,
				UserAttributes: toAttributeType(userAttributes),
				ClientMetadata: { foo: 'bar' },
			}),
		);
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockUpdateUserAttributes.mockImplementation(() => {
			throw getMockError(
				UpdateUserAttributesException.InvalidParameterException,
			);
		});
		try {
			await updateUserAttributes({
				userAttributes: {
					email: 'mockedEmail',
				},
				options: {
					clientMetadata: { foo: 'bar' },
				},
			});
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				UpdateUserAttributesException.InvalidParameterException,
			);
		}
	});
});
