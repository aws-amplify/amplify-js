// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { updateUserAttribute } from '../../../src/providers/cognito';
import { updateUserAttributes } from '../../../src/providers/cognito/apis/updateUserAttributes';
import { mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('../../../src/providers/cognito/apis/updateUserAttributes');

describe('updateUserAttribute API happy path cases', () => {
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockUpdateUserAttributes = updateUserAttributes as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	afterEach(() => {
		mockUpdateUserAttributes.mockReset();
		mockFetchAuthSession.mockClear();
	});

	it('should return correct output', async () => {
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
		mockUpdateUserAttributes.mockResolvedValue({ email: mockOutput });
		const result = await updateUserAttribute(mockInput);
		expect(result).toEqual(mockOutput);
		expect(mockUpdateUserAttributes).toHaveBeenCalledTimes(1);
		expect(mockUpdateUserAttributes).toHaveBeenCalledWith({
			userAttributes: {
				[mockInput.userAttribute.attributeKey]: mockInput.userAttribute.value,
			},
			options: mockInput.options,
		});
	});
});
