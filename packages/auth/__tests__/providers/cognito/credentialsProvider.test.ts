// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cognitoCredentialsProvider } from '../../../src/providers/cognito';
import { authAPITestParams } from './testUtils/authApiTestParams';

import * as client from '../../../src/providers/cognito/utils/clients/CredentialsForIdentityIdClient';
import { GetCredentialsForIdentityCommandOutput } from '@aws-sdk/client-cognito-identity';
import { AmplifyV6 } from '@aws-amplify/core';
import { formLoginsMap } from '../../../src/providers/cognito/apis/credentialsProvider';
import { AuthError } from '../../../src/errors/AuthError';

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
	? A
	: never;
const validAuthConfig: ArgumentTypes<typeof AmplifyV6.configure>[0] = {
	Auth: {
		userPoolId: 'us-east-1_aaaaaaa',
		identityPoolId: 'us-east:1_aaaaaaa',
		userPoolWebClientId: 'aaaaaaaaaaaa',
	},
};
const mandatorySignInEnabledConfig: ArgumentTypes<
	typeof AmplifyV6.configure
>[0] = {
	Auth: {
		userPoolId: 'us-east-1_aaaaaaa',
		identityPoolId: 'us-east:1_aaaaaaa',
		userPoolWebClientId: 'aaaaaaaaaaaa',
		isMandatorySignInEnabled: true,
	},
};
let credentialsForidentityIdSpy = jest.spyOn(
	client,
	'credentialsForIdentityIdClient'
);
let configSpy = jest.spyOn(AmplifyV6, 'getConfig');

describe('Guest Credentials', () => {
	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			credentialsForidentityIdSpy.mockImplementationOnce(
				async (params: client.CredentialsForIdentityIdClientInput) => {
					// expect(params.Logins).toBeUndefined();
					return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityCommandOutput;
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
			const creds = await cognitoCredentialsProvider.getCredentials({
				identityId: 'test',
			});
			expect(creds.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);

			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
		});
		test('in-memory guest creds are returned if not expired and not past TTL', async () => {
			await cognitoCredentialsProvider.getCredentials({
				identityId: 'test',
			});
			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
			const creds = await cognitoCredentialsProvider.getCredentials({
				identityId: 'test',
			});
			expect(creds.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);
			// expecting to be called only once becasue in-memory creds should be returned
			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
		});
	});
	describe('Error Path Cases:', () => {
		beforeEach(() => {
			credentialsForidentityIdSpy.mockImplementationOnce(
				async (params: client.CredentialsForIdentityIdClientInput) => {
					// expect(params.Logins).toBeUndefined();
					return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult as GetCredentialsForIdentityCommandOutput;
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
				cognitoCredentialsProvider.getCredentials({
					identityId: 'test',
				})
			).rejects.toThrow(AuthError);
		});
		test('Should throw AuthError if either Credentials, accessKeyId or secretKey is absent in the response', async () => {
			expect(
				cognitoCredentialsProvider.getCredentials({
					identityId: 'test',
				})
			).rejects.toThrow(AuthError);
		});
	});
});

describe('Primary Credentials', () => {
	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			credentialsForidentityIdSpy.mockImplementationOnce(
				async (params: client.CredentialsForIdentityIdClientInput) => {
					// expect(params.Logins).toBeUndefined();
					return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityCommandOutput;
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
			const creds = await cognitoCredentialsProvider.getCredentials({
				tokens: authAPITestParams.ValidAuthTokens,
				identityId: 'test',
			});
			expect(creds.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);

			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
		});
		test('in-memory primary creds are returned if not expired and not past TTL', async () => {
			await cognitoCredentialsProvider.getCredentials({
				tokens: authAPITestParams.ValidAuthTokens,
				identityId: 'test',
			});
			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
			const creds = await cognitoCredentialsProvider.getCredentials({
				tokens: authAPITestParams.ValidAuthTokens,
				identityId: 'test',
			});
			expect(creds.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);
			// expecting to be called only once becasue in-memory creds should be returned
			expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
		});
	});
	describe('Error Path Cases:', () => {
		beforeEach(() => {
			credentialsForidentityIdSpy.mockImplementationOnce(
				async (params: client.CredentialsForIdentityIdClientInput) => {
					// expect(params.Logins).toBeUndefined();
					return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult as GetCredentialsForIdentityCommandOutput;
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
				cognitoCredentialsProvider.getCredentials({
					identityId: 'test',
				})
			).rejects.toThrow(AuthError);
		});
	});
});

describe('Credentials Provider Error Path Cases:', () => {
	test('Should throw an AuthError when there is not identityId provided', async () => {
		expect(cognitoCredentialsProvider.getCredentials({})).rejects.toThrow(
			AuthError
		);
	});
});
