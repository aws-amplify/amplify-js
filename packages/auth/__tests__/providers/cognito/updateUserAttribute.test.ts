// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { updateUserAttribute } from '../../../src/providers/cognito';
import { updateUserAttributes } from '../../../src/providers/cognito/apis/updateUserAttributes';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

import { mockAccessToken } from './testUtils/data';

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock('../../../src/providers/cognito/apis/updateUserAttributes');

const mockCtx = createMockAmplifyContext();

describe('updateUserAttribute API happy path cases', () => {
	const mockFetchAuthSession = mockCtx.fetchAuthSession as jest.Mock;
	const mockUpdateUserAttributes = updateUserAttributes as jest.Mock;

	beforeAll(() => {
		(mockCtx as any).resourcesConfig = {
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
				},
			},
		};
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
		const result = await updateUserAttribute(mockCtx, mockInput);
		expect(result).toEqual(mockOutput);
		expect(mockUpdateUserAttributes).toHaveBeenCalledTimes(1);
		expect(mockUpdateUserAttributes).toHaveBeenCalledWith(mockCtx, {
			userAttributes: {
				[mockInput.userAttribute.attributeKey]: mockInput.userAttribute.value,
			},
			options: mockInput.options,
		});
	});
});
