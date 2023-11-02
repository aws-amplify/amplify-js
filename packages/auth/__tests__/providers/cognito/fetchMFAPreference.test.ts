// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import * as getUserClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { AuthError } from '../../../src/errors/AuthError';
import { fetchMFAPreference } from '../../../src/providers/cognito/apis/fetchMFAPreference';
import { GetUserException } from '../../../src/providers/cognito/types/errors';
import { GetUserCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
jest.mock('@aws-amplify/core/dist/cjs/clients/handlers/fetch');

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
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const mockFetchAuthSession = fetchAuthSession as jest.Mock;

describe('fetchMFAPreference Happy Path Cases:', () => {
	let getUserClientSpy;

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
		getUserClientSpy = jest
			.spyOn(getUserClient, 'getUser')
			.mockImplementationOnce(async (): Promise<GetUserCommandOutput> => {
				return {
					UserAttributes: [],
					Username: 'XXXXXXXX',
					PreferredMfaSetting: 'SMS_MFA',
					UserMFASettingList: ['SMS_MFA', 'SOFTWARE_TOKEN_MFA'],
					$metadata: {},
				};
			});
	});
	afterEach(() => {
		getUserClientSpy.mockClear();
		mockFetchAuthSession.mockClear();
	});

	test('fetchMFAPreference should return the preferred MFA setting', async () => {
		const resp = await fetchMFAPreference();
		expect(resp).toEqual({ preferred: 'SMS', enabled: ['SMS', 'TOTP'] });
		expect(getUserClientSpy).toHaveBeenCalledTimes(1);
		expect(getUserClientSpy).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AccessToken: mockedAccessToken,
			}
		);
	});
});

describe('fetchMFAPreference Error Path Cases:', () => {
	test('fetchMFAPreference should expect a service error', async () => {
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(GetUserException.InvalidParameterException)
			)
		);
		mockFetchAuthSession.mockImplementationOnce(
			async (): Promise<{ tokens: { accessToken: any } }> => {
				return {
					tokens: {
						accessToken: decodeJWT(mockedAccessToken),
					},
				};
			}
		);
		try {
			await fetchMFAPreference();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(GetUserException.InvalidParameterException);
		}
	});
});
