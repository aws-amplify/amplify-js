// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	UpdateMFAPreferenceInput,
	updateMFAPreference,
} from '../../../src/providers/cognito';
import { setUserMFAPreference } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { AuthError } from '../../../src/errors/AuthError';
import { SetUserMFAPreferenceException } from '../../../src/providers/cognito/types/errors';
import { getMFASettings } from '../../../src/providers/cognito/apis/updateMFAPreference';
import { SetUserMFAPreferenceCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { getMockError, mockAccessToken } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);

const mfaChoices: UpdateMFAPreferenceInput[] = [
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
	{ sms: undefined, totp: undefined },
];

describe('updateMFAPreference', () => {
	// assert mocks
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockSetUserMFAPreference = setUserMFAPreference as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockFetchAuthSession.mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockSetUserMFAPreference.mockResolvedValue({});
	});

	afterEach(() => {
		mockSetUserMFAPreference.mockReset();
		mockFetchAuthSession.mockClear();
	});

	it.each(mfaChoices)(
		'should update with sms $sms and totp $totp',
		async mfaChoise => {
			const { totp, sms } = mfaChoise;
			await updateMFAPreference(mfaChoise);
			expect(mockSetUserMFAPreference).toHaveBeenCalledWith(
				{
					region: 'us-west-2',
					userAgentValue: expect.any(String),
				},
				{
					AccessToken: mockAccessToken,
					SMSMfaSettings: getMFASettings(sms),
					SoftwareTokenMfaSettings: getMFASettings(totp),
				}
			);
		}
	);

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockSetUserMFAPreference.mockImplementation(() => {
			throw getMockError(
				SetUserMFAPreferenceException.InvalidParameterException
			);
		});
		try {
			await updateMFAPreference({ sms: 'ENABLED', totp: 'PREFERRED' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				SetUserMFAPreferenceException.InvalidParameterException
			);
		}
	});
});
