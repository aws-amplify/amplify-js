// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../src/errors/AuthError';
import {
	updateUserAttribute,
	UpdateUserAttributesOutput,
} from '../../../src/providers/cognito';
import * as updateUserAttributesApi from '../../../src/providers/cognito';
import { UpdateUserAttributesException } from '../../../src/providers/cognito/types/errors';
import { Amplify } from 'aws-amplify';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import * as authUtils from '../../../src';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
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
	'test_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('updateUserAttribute API happy path cases', () => {
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

	it('should call updateUserAttributes with correct input and should return correct output', async () => {
		const mockInput = {
			userAttribute: {
				attributeKey: 'email',
				value: 'mockedEmail',
			},
			options: {
				serviceOptions: {
					clientMetadata: { foo: 'bar' },
				},
			},
		};
		const mockOutput = {
			isUpdated: false,
			nextStep: {
				updateAttributeStep: 'CONFIRM_ATTRIBUTE_WITH_CODE',
				codeDeliveryDetails: {
					attributeName: 'email',
					deliveryMedium: 'EMAIL',
					destination: 'mockedEmail',
				},
			},
		};
		const updateUserAttributesSpy = jest
			.spyOn(updateUserAttributesApi, 'updateUserAttributes')
			.mockImplementationOnce(async () => {
				return { email: mockOutput } as UpdateUserAttributesOutput;
			});
		const result = await updateUserAttribute(mockInput);
		expect(result).toEqual(mockOutput);
		expect(updateUserAttributesSpy).toBeCalledTimes(1);
		expect(updateUserAttributesSpy).toHaveBeenCalledWith({
			userAttributes: {
				[mockInput.userAttribute.attributeKey]: mockInput.userAttribute.value,
			},
			options: mockInput.options,
		});
	});
});

describe('updateUserAttribute API error path cases:', () => {
	it('should raise service error', async () => {
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
