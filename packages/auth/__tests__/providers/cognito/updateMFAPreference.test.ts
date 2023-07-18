// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SetUserMFAPreferenceCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { updateMFAPreference } from '../../../src/providers/cognito';
import * as setUserMFAPreferenceClient from '../../../src/providers/cognito/utils/clients/SetUserMFAPreferenceClient';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthError } from '../../../src/errors/AuthError';
import {
	SetUserMFAPreferenceException,
} from '../../../src/providers/cognito/types/errors';
import { AmplifyErrorString } from '@aws-amplify/core';
import { UpdateMFAPreferenceRequest } from '../../../src/providers/cognito/types';
import { getMFASettings } from '../../../src/providers/cognito/apis/updateMFAPreference';

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

describe('updateMFAPreference Happy Path Cases:', () => {
	const mockedAccessToken = 'mockedAccessToken';
	let setUserMFAPreferenceClientSpy;
	const { user1 } = authAPITestParams;
	beforeEach(() => {
		setUserMFAPreferenceClientSpy = jest
			.spyOn(setUserMFAPreferenceClient, 'setUserMFAPreferenceClient')
			.mockImplementationOnce(async () => {
				return {} as SetUserMFAPreferenceCommandOutput;
			});
	});
	afterEach(() => {
		setUserMFAPreferenceClientSpy.mockClear();
	});
	test.each(mfaChoises)(
		'setUserMFAPreferenceClient should be called with all possible mfa combinations',
		async mfaChoise => {
			const { totp, sms } = mfaChoise;
			await updateMFAPreference(mfaChoise);
			expect(setUserMFAPreferenceClientSpy).toHaveBeenCalledWith({
				AccessToken: mockedAccessToken,
				SMSMfaSettings: getMFASettings(sms),
				SoftwareTokenMfaSettings: getMFASettings(totp),
			});
		}
	);
});

describe('updateMFAPreference Error Path Cases:', () => {
	const globalMock = global as any;

	test('updateMFAPreference should expect a service error', async () => {
		expect.assertions(2);
		const serviceError = new Error('service error');
		serviceError.name = SetUserMFAPreferenceException.InvalidParameterException;
		globalMock.fetch = jest.fn(() => Promise.reject(serviceError));
		try {
			await updateMFAPreference({ sms: 'ENABLED', totp: 'PREFERRED' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				SetUserMFAPreferenceException.InvalidParameterException
			);
		}
	});

	test('updateMFAPreference should expect an unknown error'+
	' when underlying error is not coming from the service', async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() =>
			Promise.reject(new Error('unknown error'))
		);
		try {
			await updateMFAPreference({ sms: 'ENABLED', totp: 'PREFERRED' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBeInstanceOf(Error);
		}
	});
});
