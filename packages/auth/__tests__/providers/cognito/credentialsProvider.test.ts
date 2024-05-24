// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	GetCredentialsForIdentityOutput,
	ResourcesConfig,
	getCredentialsForIdentity,
	sharedInMemoryStorage,
} from '@aws-amplify/core';

import {
	CognitoAWSCredentialsAndIdentityIdProvider,
	DefaultIdentityIdStore,
} from '../../../src/providers/cognito';
import { AuthError } from '../../../src/errors/AuthError';

import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	getCredentialsForIdentity: jest.fn(),
}));

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
	}),
);

const validAuthConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1_test-id',
			identityPoolId: 'us-east-1:test-id',
			userPoolClientId: 'test-id',
			allowGuestAccess: true,
		},
	},
};
const inValidAuthConfig: ResourcesConfig = {
	Auth: undefined,
};
const disallowGuestAccessConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1_test-id',
			identityPoolId: 'us-east_1:test-id',
			userPoolClientId: 'test-id',
			allowGuestAccess: false,
		},
	},
};

const credentialsForIdentityIdSpy = getCredentialsForIdentity as jest.Mock;

describe('Guest Credentials', () => {
	let cognitoCredentialsProvider: CognitoAWSCredentialsAndIdentityIdProvider;

	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			cognitoCredentialsProvider =
				new CognitoAWSCredentialsAndIdentityIdProvider(
					new DefaultIdentityIdStore(sharedInMemoryStorage),
				);
			credentialsForIdentityIdSpy.mockImplementationOnce(async () => {
				return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
			});
		});
		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
			credentialsForIdentityIdSpy?.mockReset();
		});
		test('Should call identityIdClient with no logins to obtain guest creds', async () => {
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: validAuthConfig.Auth!,
			});
			expect(res?.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials
					.AccessKeyId,
			);

			expect(credentialsForIdentityIdSpy).toHaveBeenCalledTimes(1);
			expect(credentialsForIdentityIdSpy).toHaveBeenCalledWith(
				{ region: 'us-east-1' },
				{ IdentityId: 'identity-id-test' },
			);
			expect(
				(cognitoCredentialsProvider as any)._nextCredentialsRefresh,
			).toBeGreaterThan(0);
		});

		test('in-memory guest creds are returned if not expired and not past TTL', async () => {
			await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: validAuthConfig.Auth!,
			});
			expect(credentialsForIdentityIdSpy).toHaveBeenCalledTimes(1);
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: validAuthConfig.Auth!,
			});
			expect(res?.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials
					.AccessKeyId,
			);
			// expecting to be called only once becasue in-memory creds should be returned
			expect(credentialsForIdentityIdSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('Error Path Cases:', () => {
		beforeEach(() => {
			cognitoCredentialsProvider =
				new CognitoAWSCredentialsAndIdentityIdProvider(
					new DefaultIdentityIdStore(sharedInMemoryStorage),
				);
			credentialsForIdentityIdSpy.mockImplementationOnce(async () => {
				return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
			});
		});

		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
		});
		afterAll(() => {
			credentialsForIdentityIdSpy?.mockReset();
		});
		test('Should not throw AuthError when allowGuestAccess is false in the config', async () => {
			expect(
				await cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: false,
					authConfig: disallowGuestAccessConfig.Auth!,
				}),
			).toBe(undefined);
		});
		test('Should not throw AuthError when there is no Cognito object in the config', async () => {
			expect(
				await cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: false,
					authConfig: inValidAuthConfig.Auth!,
				}),
			).toBe(undefined);
		});
	});
});

describe('Primary Credentials', () => {
	let cognitoCredentialsProvider: CognitoAWSCredentialsAndIdentityIdProvider;
	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			cognitoCredentialsProvider =
				new CognitoAWSCredentialsAndIdentityIdProvider(
					new DefaultIdentityIdStore(sharedInMemoryStorage),
				);
			credentialsForIdentityIdSpy.mockImplementation(async () => {
				return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
			});
		});
		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
			credentialsForIdentityIdSpy?.mockReset();
		});
		test('Should call identityIdClient with the logins map to obtain primary creds', async () => {
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(res?.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials
					.AccessKeyId,
			);

			expect(credentialsForIdentityIdSpy).toHaveBeenCalledTimes(1);
		});
		test('in-memory primary creds are returned if not expired and not past TTL', async () => {
			await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(credentialsForIdentityIdSpy).toHaveBeenCalledWith(
				{
					region: authAPITestParams.CredentialsClientRequest.region,
				},
				authAPITestParams.CredentialsClientRequest.withValidAuthToken,
			);
			expect(credentialsForIdentityIdSpy).toHaveBeenCalledTimes(1);

			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(res?.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials
					.AccessKeyId,
			);
			// expecting to be called only once becasue in-memory creds should be returned
			expect(credentialsForIdentityIdSpy).toHaveBeenCalledTimes(1);
		});
		test('Should get new credentials when tokens have changed', async () => {
			await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(credentialsForIdentityIdSpy).toHaveBeenCalledWith(
				{
					region: authAPITestParams.CredentialsClientRequest.region,
				},
				authAPITestParams.CredentialsClientRequest.withValidAuthToken,
			);
			expect(credentialsForIdentityIdSpy).toHaveBeenCalledTimes(1);

			await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.NewValidAuthTokens,
			});
			expect(credentialsForIdentityIdSpy).toHaveBeenCalledWith(
				{
					region: authAPITestParams.CredentialsClientRequest.region,
				},
				authAPITestParams.CredentialsClientRequest.withNewValidAuthToken,
			);
			expect(credentialsForIdentityIdSpy).toHaveBeenCalledTimes(2);
		});
	});
	describe('Error Path Cases:', () => {
		beforeEach(() => {
			cognitoCredentialsProvider =
				new CognitoAWSCredentialsAndIdentityIdProvider(
					new DefaultIdentityIdStore(sharedInMemoryStorage),
				);
		});
		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
		});
		afterAll(() => {
			credentialsForIdentityIdSpy?.mockReset();
		});
		test('Should throw AuthError if either Credentials, accessKeyId or secretKey is absent in the response', async () => {
			credentialsForIdentityIdSpy.mockImplementationOnce(async () => {
				return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
			});
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: true,
					authConfig: validAuthConfig.Auth!,
					tokens: authAPITestParams.ValidAuthTokens,
				}),
			).rejects.toThrow(AuthError);
			credentialsForIdentityIdSpy.mockClear();
			credentialsForIdentityIdSpy.mockImplementationOnce(async () => {
				return authAPITestParams.NoCredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
			});
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: true,
					authConfig: validAuthConfig.Auth!,
					tokens: authAPITestParams.ValidAuthTokens,
				}),
			).rejects.toThrow(AuthError);
			credentialsForIdentityIdSpy.mockClear();
			credentialsForIdentityIdSpy.mockImplementationOnce(async () => {
				return authAPITestParams.NoSecretKeyInCredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
			});
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: true,
					authConfig: validAuthConfig.Auth!,
					tokens: authAPITestParams.ValidAuthTokens,
				}),
			).rejects.toThrow(AuthError);
		});
	});
});
