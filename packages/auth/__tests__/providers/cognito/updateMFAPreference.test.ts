// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';

import {
	UpdateMFAPreferenceInput,
	updateMFAPreference,
} from '../../../src/providers/cognito';
import { AuthError } from '../../../src/errors/AuthError';
import { SetUserMFAPreferenceException } from '../../../src/providers/cognito/types/errors';
import { getMFASettings } from '../../../src/providers/cognito/apis/updateMFAPreference';
import { MFAPreference } from '../../../src/providers/cognito/types';
import { createSetUserMFAPreferenceClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

import { getMockError, mockAccessToken } from './testUtils/data';

type MfaPreferenceValue = MFAPreference | undefined;

jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

// generates all preference permutations
const generateUpdateMFAPreferenceOptions = () => {
	const mfaPreferenceTypes: MfaPreferenceValue[] = [
		'PREFERRED',
		'NOT_PREFERRED',
		'ENABLED',
		'DISABLED',
		undefined,
	];
	const mfaKeys: (keyof UpdateMFAPreferenceInput)[] = ['email', 'sms', 'totp'];

	const generatePermutations = <T>(
		keys: string[],
		values: T[],
	): Record<string, T>[] => {
		if (!keys.length) return [{}];

		const [curr, ...rest] = keys;
		const permutations: Record<string, T>[] = [];

		for (const value of values) {
			for (const perm of generatePermutations(rest, values)) {
				permutations.push({ ...perm, [curr]: value });
			}
		}

		return permutations;
	};

	return generatePermutations(mfaKeys, mfaPreferenceTypes);
};

const mfaChoices = generateUpdateMFAPreferenceOptions();

describe('updateMFAPreference', () => {
	// assert mocks
	const mockSetUserMFAPreference = jest.fn();
	const mockCreateSetUserMFAPreferenceClient = jest.mocked(
		createSetUserMFAPreferenceClient,
	);
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);

	const mockCtx = createMockAmplifyContext({
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	});

	beforeAll(() => {
		(mockCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
	});

	beforeEach(() => {
		mockSetUserMFAPreference.mockResolvedValue({});
		mockCreateSetUserMFAPreferenceClient.mockReturnValueOnce(
			mockSetUserMFAPreference,
		);
	});

	afterEach(() => {
		mockSetUserMFAPreference.mockReset();
		(mockCtx.fetchAuthSession as jest.Mock).mockClear();
		mockCreateSetUserMFAPreferenceClient.mockClear();
	});

	it.each(mfaChoices)(
		'should update with email $email, sms $sms, and totp $totp',
		async mfaChoice => {
			const { totp, sms, email } = mfaChoice;
			await updateMFAPreference(mockCtx, mfaChoice);
			expect(mockSetUserMFAPreference).toHaveBeenCalledWith(
				{
					region: 'us-west-2',
					userAgentValue: expect.any(String),
				},
				{
					AccessToken: mockAccessToken,
					SMSMfaSettings: getMFASettings(sms),
					SoftwareTokenMfaSettings: getMFASettings(totp),
					EmailMfaSettings: getMFASettings(email),
				},
			);
		},
	);

	it('invokes mockCreateCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
		const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
		const endpointCtx = createMockAmplifyContext({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});
		(endpointCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});
		await updateMFAPreference(endpointCtx, mfaChoices[0]);

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockSetUserMFAPreference.mockImplementation(() => {
			throw getMockError(
				SetUserMFAPreferenceException.InvalidParameterException,
			);
		});
		try {
			await updateMFAPreference(mockCtx, { sms: 'ENABLED', totp: 'PREFERRED' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				SetUserMFAPreferenceException.InvalidParameterException,
			);
		}
	});
});
