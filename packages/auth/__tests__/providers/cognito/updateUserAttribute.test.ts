// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import { updateUserAttribute } from '../../../src/providers/cognito';
import { UpdateUserAttributesException } from '../../../src/providers/cognito/types/errors';
import * as updateUserAttributesClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { Amplify } from 'aws-amplify';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import * as authUtils from '../../../src';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { UpdateUserAttributesCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { toAttributeType } from '../../../src/providers/cognito/utils/apiHelpers';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			userPoolId: 'us-west-2_zzzzz',
			identityPoolId: 'us-west-2:xxxxxx',
		},
	},
});
const mockedAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('updateUserAttribute  API happy path cases', () => {
	let fetchAuthSessionsSpy;
	beforeEach(() => {
		fetchAuthSessionsSpy = jest
			.spyOn(authUtils, 'fetchAuthSession')
			.mockImplementationOnce(
				async (): Promise<{ tokens: { accessToken: any } }> => {
					return {
						tokens: {
							accessToken: decodeJWT(mockedAccessToken),
						},
					};
				}
			);
	});

	afterEach(() => {
		fetchAuthSessionsSpy.mockClear();
	});

	test('updateUserAttribute API should return isUpdated and nextStep with not updated attributes', async () => {
		const updateUserAttributesClientSpy = jest
			.spyOn(updateUserAttributesClient, 'updateUserAttributes')
			.mockImplementationOnce(
				async (): Promise<UpdateUserAttributesCommandOutput> => {
					return {
						CodeDeliveryDetailsList: [
							{
								AttributeName: 'email',
								DeliveryMedium: 'EMAIL',
								Destination: 'mockedEmail',
							},
						],
					} as UpdateUserAttributesCommandOutput;
				}
			);
		const result = await updateUserAttribute({
			userAttribute: {
				attributeKey: 'email',
				value: 'mockedEmail',
			},
			options: {
				serviceOptions: {
					clientMetadata: { foo: 'bar' },
				},
			},
		});
		expect(result).toEqual({
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
		expect(updateUserAttributesClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				UserAttributes: toAttributeType({ email: 'mockedEmail' }),
				ClientMetadata: { foo: 'bar' },
			})
		);
	});

	test('updateUserAttribute API should return isUpdated and nextStep with updated attributes only', async () => {
		const updateUserAttributesClientSpy = jest
			.spyOn(updateUserAttributesClient, 'updateUserAttributes')
			.mockImplementationOnce(
				async (): Promise<UpdateUserAttributesCommandOutput> => {
					return {} as UpdateUserAttributesCommandOutput;
				}
			);
		const result = await updateUserAttribute({
			userAttribute: {
				attributeKey: 'name',
				value: 'mockedName',
			},
			options: {
				serviceOptions: {
					clientMetadata: { foo: 'bar' },
				},
			},
		});
		expect(result).toEqual({
			isUpdated: true,
			nextStep: {
				updateAttributeStep: 'DONE',
			},
		});
		expect(updateUserAttributesClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccessToken,
				UserAttributes: toAttributeType({ name: 'mockedName' }),
				ClientMetadata: { foo: 'bar' },
			})
		);
	});
});

describe('updateUserAttribute  API error path cases:', () => {
	test('updateUserAttribute API should raise service error', async () => {
		expect.assertions(2);
		jest
			.spyOn(authUtils, 'fetchAuthSession')
			.mockImplementationOnce(
				async (): Promise<{ tokens: { accessToken: any } }> => {
					return {
						tokens: {
							accessToken: decodeJWT(mockedAccessToken),
						},
					};
				}
			);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(
					UpdateUserAttributesException.InvalidParameterException
				)
			)
		);
		try {
			await updateUserAttribute({
				userAttribute: {
					attributeKey: 'email',
					value: 'mockedEmail',
				},
				options: {
					serviceOptions: {
						clientMetadata: { foo: 'bar' },
					},
				},
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				UpdateUserAttributesException.InvalidParameterException
			);
		}
	});
});
