// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthError } from '../../../src/errors/AuthError';
import { AssociateSoftwareTokenException } from '../../../src/providers/cognito/types/errors';
import * as associateSoftwareTokenClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { setUpTOTP } from '../../../src/providers/cognito';
import { AssociateSoftwareTokenCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
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
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('setUpTOTP API happy path cases', () => {
	let associateSoftwareTokenClientSpy;
	let fetchAuthSessionsSpy;
	const secretCode = 'asfdasdfwefasdfasf';
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
		associateSoftwareTokenClientSpy = jest
			.spyOn(associateSoftwareTokenClient, 'associateSoftwareToken')
			.mockImplementationOnce(
				async (): Promise<AssociateSoftwareTokenCommandOutput> => {
					return {
						SecretCode: secretCode,
						$metadata: {},
					};
				}
			);
	});

	afterEach(() => {
		associateSoftwareTokenClientSpy.mockClear();
		fetchAuthSessionsSpy.mockClear();
	});

	test('setUpTOTP API should call the UserPoolClient and should return a TOTPSetupDetails', async () => {
		const result = await setUpTOTP();
		expect(associateSoftwareTokenClientSpy).toHaveBeenCalledWith(
			{ 
				region: 'us-west-2',
				userAgentValue: expect.any(String)
			},
			{
				AccessToken: mockedAccessToken,
			}
		);
		expect(result.sharedSecret).toEqual(secretCode);
		expect(result.getSetupUri('appName', 'amplify')).toBeInstanceOf(URL);
	});
});

describe('setUpTOTP API error path cases:', () => {
	test('setUpTOTP  API should raise service error', async () => {
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(
					AssociateSoftwareTokenException.InvalidParameterException
				)
			)
		);
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
		try {
			await setUpTOTP();
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				AssociateSoftwareTokenException.InvalidParameterException
			);
		}
	});
});
