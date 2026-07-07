// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../src/errors/AuthError';
import { fetchMFAPreference } from '../../../src/providers/cognito/apis/fetchMFAPreference';
import { GetUserException } from '../../../src/providers/cognito/types/errors';
import { createGetUserClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

import { getMockError, mockAccessToken } from './testUtils/data';

jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

describe('fetchMFAPreference', () => {
	const mockGetUser = jest.fn();
	const mockCreateGetUserClient = jest.mocked(createGetUserClient);
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
		mockCreateGetUserClient.mockReturnValue(mockGetUser);
	});

	afterEach(() => {
		mockGetUser.mockReset();
		(mockCtx.fetchAuthSession as jest.Mock).mockClear();
	});

	it('should return correct MFA preferences when SMS is preferred', async () => {
		mockGetUser.mockResolvedValueOnce({
			UserAttributes: [],
			Username: 'XXXXXXXX',
			PreferredMfaSetting: 'SMS_MFA',
			UserMFASettingList: ['SMS_MFA', 'SOFTWARE_TOKEN_MFA', 'EMAIL_OTP'],
			$metadata: {},
		});
		const resp = await fetchMFAPreference(mockCtx);
		expect(resp).toEqual({
			preferred: 'SMS',
			enabled: ['SMS', 'TOTP', 'EMAIL'],
		});
	});

	it('should return correct MFA preferences when EMAIL is preferred', async () => {
		mockGetUser.mockResolvedValueOnce({
			UserAttributes: [],
			Username: 'XXXXXXXX',
			PreferredMfaSetting: 'EMAIL_OTP',
			UserMFASettingList: ['SMS_MFA', 'SOFTWARE_TOKEN_MFA', 'EMAIL_OTP'],
			$metadata: {},
		});
		const resp = await fetchMFAPreference(mockCtx);
		expect(resp).toEqual({
			preferred: 'EMAIL',
			enabled: ['SMS', 'TOTP', 'EMAIL'],
		});
	});
	it('should return correct MFA preferences when TOTP is preferred', async () => {
		mockGetUser.mockResolvedValueOnce({
			UserAttributes: [],
			Username: 'XXXXXXXX',
			PreferredMfaSetting: 'SOFTWARE_TOKEN_MFA',
			UserMFASettingList: ['SMS_MFA', 'SOFTWARE_TOKEN_MFA', 'EMAIL_OTP'],
			$metadata: {},
		});
		const resp = await fetchMFAPreference(mockCtx);
		expect(resp).toEqual({
			preferred: 'TOTP',
			enabled: ['SMS', 'TOTP', 'EMAIL'],
		});
	});
	it('should return the correct MFA preferences when there is no preferred option', async () => {
		mockGetUser.mockResolvedValueOnce({
			UserAttributes: [],
			Username: 'XXXXXXXX',
			UserMFASettingList: ['SMS_MFA', 'SOFTWARE_TOKEN_MFA', 'EMAIL_OTP'],
			$metadata: {},
		});
		const resp = await fetchMFAPreference(mockCtx);
		expect(resp).toEqual({
			enabled: ['SMS', 'TOTP', 'EMAIL'],
		});
	});
	it('should return the correct MFA preferences when there is no available options', async () => {
		mockGetUser.mockResolvedValueOnce({
			UserAttributes: [],
			Username: 'XXXXXXXX',
			$metadata: {},
		});
		const resp = await fetchMFAPreference(mockCtx);
		expect(resp).toEqual({});
	});

	it('invokes mockCreateCognitoUserPoolEndpointResolver with expected endpointOverride', async () => {
		const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
		const customCtx = createMockAmplifyContext({
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					userPoolEndpoint: expectedUserPoolEndpoint,
				},
			},
		});
		(customCtx.fetchAuthSession as jest.Mock).mockResolvedValue({
			tokens: { accessToken: decodeJWT(mockAccessToken) },
		});

		mockGetUser.mockResolvedValueOnce({
			UserAttributes: [],
			Username: 'XXXXXXXX',
			PreferredMfaSetting: 'SMS_MFA',
			UserMFASettingList: ['SMS_MFA', 'SOFTWARE_TOKEN_MFA', 'EMAIL_OTP'],
			$metadata: {},
		});

		await fetchMFAPreference(customCtx);

		expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: expectedUserPoolEndpoint,
		});
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockGetUser.mockImplementation(() => {
			throw getMockError(GetUserException.InvalidParameterException);
		});
		try {
			await fetchMFAPreference(mockCtx);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(GetUserException.InvalidParameterException);
		}
	});
});
