// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import {
	updateUserAttribute,
	UpdateUserAttributesOutput,
} from '../../../src/providers/cognito';
import * as updateUserAttributesApi from '../../../src/providers/cognito';
import { UpdateUserAttributesException } from '../../../src/providers/cognito/types/errors';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { updateUserAttributes } from '../../../src/providers/cognito/apis/updateUserAttributes';
jest.mock('@aws-amplify/core/dist/cjs/clients/handlers/fetch');
jest.mock('../../../src/providers/cognito/apis/updateUserAttributes');

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	fetchAuthSession: jest.fn(),
	Amplify: {
		configure: jest.fn(),
		getConfig: jest.fn(() => ({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
				},
			},
		})),
	},
}));
const mockedAccessToken =
	'test_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const mockFetchAuthSession = fetchAuthSession as jest.Mock;
const mockUpdateUserAttributes = updateUserAttributes as jest.Mock;
describe('updateUserAttribute API happy path cases', () => {
	beforeEach(() => {
		mockFetchAuthSession.mockImplementationOnce(
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
		mockFetchAuthSession.mockClear();
	});

	it('should call updateUserAttributes with correct input and should return correct output', async () => {
		const mockInput = {
			userAttribute: {
				attributeKey: 'email',
				value: 'mockedEmail',
			},
			options: {
				clientMetadata: { foo: 'bar' },
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
		mockUpdateUserAttributes.mockImplementationOnce(async () => {
			return { email: mockOutput } as UpdateUserAttributesOutput;
		});
		const result = await updateUserAttribute(mockInput);
		expect(result).toEqual(mockOutput);
		expect(mockUpdateUserAttributes).toBeCalledTimes(1);
		expect(mockUpdateUserAttributes).toHaveBeenCalledWith({
			userAttributes: {
				[mockInput.userAttribute.attributeKey]: mockInput.userAttribute.value,
			},
			options: mockInput.options,
		});
	});
});
