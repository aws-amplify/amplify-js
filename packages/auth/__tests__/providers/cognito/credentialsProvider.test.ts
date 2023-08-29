// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cognitoCredentialsProvider } from '../../../src/providers/cognito';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthError } from '../../../src/errors/AuthError';
import {
	getCredentialsForIdentity,
	GetCredentialsForIdentityInput,
	GetCredentialsForIdentityOutput,
	ResourcesConfig,
} from '@aws-amplify/core';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	getCredentialsForIdentity: jest.fn(),
}));

jest.mock('@aws-amplify/core/lib/AwsClients/CognitoIdentity');

jest.mock(
	'./../../../src/providers/cognito/credentialsProvider/IdentityIdProvider',
	() => ({
		cognitoIdentityIdProvider: jest
			.fn()
			.mockReturnValueOnce('identity-id-test')
			.mockReturnValueOnce('identity-id-test')
			.mockReturnValueOnce('identity-id-test')
			.mockReturnValueOnce('identity-id-test')
			.mockReturnValueOnce('identity-id-test')
			.mockReturnValueOnce('identity-id-test')
			.mockReturnValueOnce('identity-id-test')
			.mockReturnValueOnce('identity-id-test')
			.mockReturnValueOnce('identity-id-test')
			.mockReturnValueOnce(undefined),
	})
);

const mockGetCredentialsForIdentity = getCredentialsForIdentity as jest.Mock;

const defaultConfigThatDoesNotAllowGuestAccess: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1_test-id',
			identityPoolId: 'us-east:1_test-id',
			userPoolClientId: 'test-id',
		},
	},
};

const allowGuestAccessConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1_test-id',
			identityPoolId: 'us-east:1_test-id',
			userPoolClientId: 'test-id',
			allowGuestAccess: true,
		},
	},
};

describe('Guest Credentials', () => {
	cognitoCredentialsProvider.setAuthConfig(allowGuestAccessConfig.Auth!);
	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			mockGetCredentialsForIdentity.mockImplementationOnce(
				async (config: {}, params: GetCredentialsForIdentityInput) => {
					return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
				}
			);
		});

		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
			mockGetCredentialsForIdentity?.mockReset();
		});

		test('Should call identityIdClient with no logins to obtain guest creds', async () => {
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: allowGuestAccessConfig.Auth!,
			});
			expect(res.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);

			expect(mockGetCredentialsForIdentity).toBeCalledTimes(1);
		});

		test('in-memory guest creds are returned if not expired and not past TTL', async () => {
			await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: allowGuestAccessConfig.Auth!,
			});
			expect(mockGetCredentialsForIdentity).toBeCalledTimes(1);
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: allowGuestAccessConfig.Auth!,
			});
			expect(res.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);
			// expecting to be called only once becasue in-memory creds should be returned
			expect(mockGetCredentialsForIdentity).toBeCalledTimes(1);
		});
	});
	describe('Error Path Cases:', () => {
		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
		});

		afterAll(() => {
			mockGetCredentialsForIdentity?.mockReset();
		});

		test('Should throw AuthError when allowGuestAccess is set to false in the config', async () => {
			mockGetCredentialsForIdentity.mockImplementationOnce(
				async (config: {}, params: GetCredentialsForIdentityInput) => {
					return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
				}
			);
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: false,
					authConfig: defaultConfigThatDoesNotAllowGuestAccess.Auth!,
				})
			).rejects.toThrow(AuthError);
		});

		test('Should throw AuthError if either Credentials, accessKeyId or secretKey is absent in the response', async () => {
			mockGetCredentialsForIdentity.mockImplementationOnce(
				async (config: {}, params: GetCredentialsForIdentityInput) => {
					return {} as GetCredentialsForIdentityOutput;
				}
			);
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: false,
					authConfig: defaultConfigThatDoesNotAllowGuestAccess.Auth!,
				})
			).rejects.toThrow(AuthError);
		});
	});
});

describe('Primary Credentials', () => {
	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			mockGetCredentialsForIdentity.mockImplementationOnce(
				async (config: {}, params: GetCredentialsForIdentityInput) => {
					// expect(params.Logins).toBeUndefined();
					return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
				}
			);
		});

		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
			mockGetCredentialsForIdentity?.mockReset();
		});

		test('Should call identityIdClient with the logins map to obtain primary creds', async () => {
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: defaultConfigThatDoesNotAllowGuestAccess.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(res.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);

			expect(mockGetCredentialsForIdentity).toBeCalledTimes(1);
		});

		test('in-memory primary creds are returned if not expired and not past TTL', async () => {
			await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: defaultConfigThatDoesNotAllowGuestAccess.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(mockGetCredentialsForIdentity).toBeCalledTimes(1);
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: defaultConfigThatDoesNotAllowGuestAccess.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(res.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);
			// expecting to be called only once becasue in-memory creds should be returned
			expect(mockGetCredentialsForIdentity).toBeCalledTimes(1);
		});
	});

	describe('Error Path Cases:', () => {
		beforeEach(() => {
			mockGetCredentialsForIdentity.mockImplementationOnce(
				async (config: {}, params: GetCredentialsForIdentityInput) => {
					// expect(params.Logins).toBeUndefined();
					return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
				}
			);
		});

		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
		});

		afterAll(() => {
			mockGetCredentialsForIdentity?.mockReset();
		});

		test('Should throw AuthError if either Credentials, accessKeyId or secretKey is absent in the response', async () => {
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: true,
					authConfig: defaultConfigThatDoesNotAllowGuestAccess.Auth!,
					tokens: authAPITestParams.ValidAuthTokens,
				})
			).rejects.toThrow(AuthError);
		});
	});
});

describe('Credentials Provider Error Path Cases:', () => {
	test('Should throw an AuthError when there is not identityId provided', async () => {
		expect(
			cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: defaultConfigThatDoesNotAllowGuestAccess.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			})
		).rejects.toThrow(AuthError);
	});
});
