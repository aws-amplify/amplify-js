// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cognitoCredentialsProvider } from '../../../src/providers/cognito';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthError } from '../../../src/errors/AuthError';

// TODO(V6): import these from top level core/ and not lib/
import * as cogId from '@aws-amplify/core';
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

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
	? A
	: never;
const validAuthConfig: ArgumentTypes<typeof cogId.AmplifyV6.configure>[0] = {
	Auth: {
		userPoolId: 'us-east-1_test-id',
		identityPoolId: 'us-east:1_test-id',
		userPoolWebClientId: 'test-id',
	},
};
const mandatorySignInEnabledConfig: ArgumentTypes<
	typeof cogId.AmplifyV6.configure
>[0] = {
	Auth: {
		userPoolId: 'us-east-1_test-id',
		identityPoolId: 'us-east:1_test-id',
		userPoolWebClientId: 'test-id',
		isMandatorySignInEnabled: true,
	},
};
const credentialsForidentityIdSpy = jest.spyOn(
	cogId,
	'getCredentialsForIdentity'
);
const configSpy = jest.spyOn(cogId.AmplifyV6, 'getConfig');

describe('Guest Credentials', () => {
	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			credentialsForidentityIdSpy.mockImplementationOnce(
				async (config: {}, params: cogId.GetCredentialsForIdentityInput) => {
					return authAPITestParams.CredentialsForIdentityIdResult as cogId.GetCredentialsForIdentityOutput;
				}
			);
			configSpy.mockImplementationOnce(() => validAuthConfig);
		});
		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
		});
		afterAll(() => {
			configSpy?.mockReset();
			credentialsForidentityIdSpy?.mockReset();
		});
		test('Should call identityIdClient with no logins to obtain guest creds', async () => {
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: validAuthConfig.Auth!,
			});
			expect(res.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);

			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
		});
		test('in-memory guest creds are returned if not expired and not past TTL', async () => {
			await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: validAuthConfig.Auth!,
			});
			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: validAuthConfig.Auth!,
			});
			expect(res.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);
			// expecting to be called only once becasue in-memory creds should be returned
			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
		});
	});
	describe('Error Path Cases:', () => {
		beforeEach(() => {
			credentialsForidentityIdSpy.mockImplementationOnce(
				async (config: {}, params: cogId.GetCredentialsForIdentityInput) => {
					return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult as cogId.GetCredentialsForIdentityOutput;
				}
			);
			configSpy.mockImplementationOnce(() => mandatorySignInEnabledConfig);
		});
		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
		});
		afterAll(() => {
			configSpy?.mockReset();
			credentialsForidentityIdSpy?.mockReset();
		});
		test('Should throw AuthError when isMandatorySignInEnabled is true in the config', async () => {
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: false,
					authConfig: validAuthConfig.Auth!,
				})
			).rejects.toThrow(AuthError);
		});
		test('Should throw AuthError if either Credentials, accessKeyId or secretKey is absent in the response', async () => {
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: false,
					authConfig: validAuthConfig.Auth!,
				})
			).rejects.toThrow(AuthError);
		});
	});
});

describe('Primary Credentials', () => {
	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			credentialsForidentityIdSpy.mockImplementationOnce(
				async (config: {}, params: cogId.GetCredentialsForIdentityInput) => {
					// expect(params.Logins).toBeUndefined();
					return authAPITestParams.CredentialsForIdentityIdResult as cogId.GetCredentialsForIdentityOutput;
				}
			);
			configSpy.mockImplementation(() => validAuthConfig);
		});
		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
		});
		afterAll(() => {
			configSpy?.mockReset();
			credentialsForidentityIdSpy?.mockReset();
		});
		test('Should call identityIdClient with the logins map to obtain primary creds', async () => {
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(res.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);

			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
		});
		test('in-memory primary creds are returned if not expired and not past TTL', async () => {
			await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(res.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);
			// expecting to be called only once becasue in-memory creds should be returned
			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
		});
	});
	describe('Error Path Cases:', () => {
		beforeEach(() => {
			credentialsForidentityIdSpy.mockImplementationOnce(
				async (config: {}, params: cogId.GetCredentialsForIdentityInput) => {
					// expect(params.Logins).toBeUndefined();
					return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult as cogId.GetCredentialsForIdentityOutput;
				}
			);
			configSpy.mockImplementationOnce(() => mandatorySignInEnabledConfig);
		});
		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
		});
		afterAll(() => {
			configSpy?.mockReset();
			credentialsForidentityIdSpy?.mockReset();
		});
		test('Should throw AuthError if either Credentials, accessKeyId or secretKey is absent in the response', async () => {
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: true,
					authConfig: validAuthConfig.Auth!,
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
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			})
		).rejects.toThrow(AuthError);
	});
});
