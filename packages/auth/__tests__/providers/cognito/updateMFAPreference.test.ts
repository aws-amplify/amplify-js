// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateMFAPreference } from '../../../src/providers/cognito';
import * as setUserMFAPreferenceClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { AuthError } from '../../../src/errors/AuthError';
import { SetUserMFAPreferenceException } from '../../../src/providers/cognito/types/errors';
import { UpdateMFAPreferenceRequest } from '../../../src/providers/cognito/types';
import { getMFASettings } from '../../../src/providers/cognito/apis/updateMFAPreference';
import { SetUserMFAPreferenceCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { Amplify } from 'aws-amplify';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import * as authUtils from '../../../src';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
jest.mock('@aws-amplify/core/dist/cjs/clients/handlers/fetch');

const mfaChoises: UpdateMFAPreferenceRequest[] = [
	{ sms: 'DISABLED', totp: 'DISABLED' },
	{ sms: 'DISABLED', totp: 'ENABLED' },
	{ sms: 'DISABLED', totp: 'PREFERRED' },
	{ sms: 'DISABLED', totp: 'NOT_PREFERRED' },
	{ sms: 'ENABLED', totp: 'DISABLED' },
	{ sms: 'ENABLED', totp: 'ENABLED' },
	{ sms: 'ENABLED', totp: 'PREFERRED' },
	{ sms: 'ENABLED', totp: 'NOT_PREFERRED' },
	{ sms: 'PREFERRED', totp: 'DISABLED' },
	{ sms: 'PREFERRED', totp: 'ENABLED' },
	{ sms: 'PREFERRED', totp: 'PREFERRED' },
	{ sms: 'PREFERRED', totp: 'NOT_PREFERRED' },
	{ sms: 'NOT_PREFERRED', totp: 'DISABLED' },
	{ sms: 'NOT_PREFERRED', totp: 'ENABLED' },
	{ sms: 'NOT_PREFERRED', totp: 'PREFERRED' },
	{ sms: 'NOT_PREFERRED', totp: 'NOT_PREFERRED' },
	{},
];

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

describe('updateMFAPreference Happy Path Cases:', () => {
	let setUserMFAPreferenceClientSpy;
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
		setUserMFAPreferenceClientSpy = jest
			.spyOn(setUserMFAPreferenceClient, 'setUserMFAPreference')
			.mockImplementationOnce(async () => {
				return {} as SetUserMFAPreferenceCommandOutput;
			});
	});
	afterEach(() => {
		setUserMFAPreferenceClientSpy.mockClear();
		fetchAuthSessionsSpy.mockClear();
	});
	test.each(mfaChoises)(
		'setUserMFAPreferenceClient should be called with all possible mfa combinations',
		async mfaChoise => {
			const { totp, sms } = mfaChoise;
			await updateMFAPreference(mfaChoise);
			expect(setUserMFAPreferenceClientSpy).toHaveBeenCalledWith(
				{
					region: 'us-west-2',
					userAgentValue: expect.any(String),
				},
				{
					AccessToken: mockedAccessToken,
					SMSMfaSettings: getMFASettings(sms),
					SoftwareTokenMfaSettings: getMFASettings(totp),
				}
			);
		}
	);
});

describe('updateMFAPreference Error Path Cases:', () => {
	test('updateMFAPreference should expect a service error', async () => {
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(SetUserMFAPreferenceException.ForbiddenException)
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
			await updateMFAPreference({ sms: 'ENABLED', totp: 'PREFERRED' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(SetUserMFAPreferenceException.ForbiddenException);
		}
	});
});
