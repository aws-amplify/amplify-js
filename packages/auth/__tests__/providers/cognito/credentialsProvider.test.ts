// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	CognitoAWSCredentialsAndIdentityIdProvider,
	DefaultIdentityIdStore,
} from '../../../src/providers/cognito';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AuthError } from '../../../src/errors/AuthError';
import {
	GetCredentialsForIdentityInput,
	GetCredentialsForIdentityOutput,
	MemoryKeyValueStorage,
	ResourcesConfig,
	getCredentialsForIdentity,
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
	Auth: {},
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
					new DefaultIdentityIdStore(MemoryKeyValueStorage)
				);
			credentialsForIdentityIdSpy.mockImplementationOnce(
				async ({}, params: GetCredentialsForIdentityInput) => {
					return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
				}
			);
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
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);

			expect(credentialsForIdentityIdSpy).toBeCalledTimes(1);
			expect(credentialsForIdentityIdSpy).toBeCalledWith(
				{ region: 'us-east-1' },
				{ IdentityId: 'identity-id-test' }
			);
			expect(
				cognitoCredentialsProvider['_nextCredentialsRefresh']
			).toBeGreaterThan(0);
		});
		test('in-memory guest creds are returned if not expired and not past TTL', async () => {
			await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: validAuthConfig.Auth!,
			});
			expect(credentialsForIdentityIdSpy).toBeCalledTimes(1);
			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: false,
				authConfig: validAuthConfig.Auth!,
			});
			expect(res?.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);
			// expecting to be called only once becasue in-memory creds should be returned
			expect(credentialsForIdentityIdSpy).toBeCalledTimes(1);
		});
	});
	describe('Error Path Cases:', () => {
		let cognitoCredentialsProvider;
		beforeEach(() => {
			cognitoCredentialsProvider =
				new CognitoAWSCredentialsAndIdentityIdProvider(
					new DefaultIdentityIdStore(MemoryKeyValueStorage)
				);
			credentialsForIdentityIdSpy.mockImplementationOnce(
				async ({}, params: GetCredentialsForIdentityInput) => {
					return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
				}
			);
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
				})
			).toBe(undefined);
		});
		test('Should not throw AuthError when there is no Cognito object in the config', async () => {
			expect(
				await cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: false,
					authConfig: inValidAuthConfig.Auth!,
				})
			).toBe(undefined);
		});
	});
});

describe('Primary Credentials', () => {
	let cognitoCredentialsProvider;
	describe('Happy Path Cases:', () => {
		beforeEach(() => {
			cognitoCredentialsProvider =
				new CognitoAWSCredentialsAndIdentityIdProvider(
					new DefaultIdentityIdStore(MemoryKeyValueStorage)
				);
			credentialsForIdentityIdSpy.mockImplementationOnce(
				async ({}, params: GetCredentialsForIdentityInput) => {
					return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
				}
			);
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
			expect(res.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);

			expect(credentialsForIdentityIdSpy).toBeCalledTimes(1);
		});
		test('in-memory primary creds are returned if not expired and not past TTL', async () => {
			await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(credentialsForIdentityIdSpy).toBeCalledWith(
				{
					region: 'us-east-1',
				},
				{
					IdentityId: 'identity-id-test',
					Logins: {
						'cognito-idp.us-east-2.amazonaws.com/us-east-2_Q4ii7edTI':
							'eyJraWQiOiIyd1FTbElUQ2N0bWVMdTYwY3hzRFJPOW9DXC93eDZDdVMzT2lQbHRJRldYVT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzOGEwODU1Ny1hMTFkLTQzYjEtYjc5Yi03ZTNjNDE2YWUzYzciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfUTRpaTdlZFRJIiwiY29nbml0bzp1c2VybmFtZSI6InRlc3QyIiwib3JpZ2luX2p0aSI6ImRiM2QxOGE1LTViZTAtNDVmOS05Y2RjLTI3OWQyMmJmNzgxZCIsImF1ZCI6IjZ1bG1sYTc0Y245cDlhdmEwZmcxYnV1cjhxIiwiZXZlbnRfaWQiOiJhZjRjMmM5NC04ZTY0LTRkYWYtYjc5ZS02NTE0NTEyMjE3OTAiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY5MDkzMjM0MCwiZXhwIjoxNjkwOTM1OTQwLCJpYXQiOjE2OTA5MzIzNDAsImp0aSI6ImVhM2JmNmNlLWEyZWUtNGJiMC05MjdkLWNjMzRjYzRhMWVjMiIsImVtYWlsIjoiYW16bm1hbm9qQGdtYWlsLmNvbSJ9.i71wkSBPZt8BlBFMZPILJ6RsfDaJx0xqriD9y6ly3LnNB2vNAIOZqPLcCKEi8u0obyoFIK_EY7jKVRva5wbDDcHGt5YrnjT3SsWc1FGVUhrPW6IzEwbfYkUsbVGYjfO1hqTMW7q3FHvJ4yFjLDIUHQe-1_NogYeuhjrNxEupOPmE5-52N4dRriZ0DlHD4fe7gqL8B6AJXr5np1XaxZySU4KpdePwIp1Nb2fkolMEGHvOANHqWdBe5I0vRhAh0MDJ6IxvEr65tnaJNgVQuQaZFR4kQlpjemvB7kaVQ-SpH-tV_zXzqpwr_OEH6dgGMcxIsFrBFC8AGQnGXlSsS-5ThQ',
					},
				}
			);
			expect(credentialsForIdentityIdSpy).toBeCalledTimes(1);

			const res = await cognitoCredentialsProvider.getCredentialsAndIdentityId({
				authenticated: true,
				authConfig: validAuthConfig.Auth!,
				tokens: authAPITestParams.ValidAuthTokens,
			});
			expect(res.credentials.accessKeyId).toEqual(
				authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
			);
			// expecting to be called only once becasue in-memory creds should be returned
			expect(credentialsForIdentityIdSpy).toBeCalledTimes(1);
		});
	});
	describe('Error Path Cases:', () => {
		beforeEach(() => {
			cognitoCredentialsProvider =
				new CognitoAWSCredentialsAndIdentityIdProvider(
					new DefaultIdentityIdStore(MemoryKeyValueStorage)
				);
		});
		afterEach(() => {
			cognitoCredentialsProvider.clearCredentials();
		});
		afterAll(() => {
			credentialsForIdentityIdSpy?.mockReset();
		});
		test('Should throw AuthError if either Credentials, accessKeyId or secretKey is absent in the response', async () => {
			credentialsForIdentityIdSpy.mockImplementationOnce(
				async ({}, params: GetCredentialsForIdentityInput) => {
					return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
				}
			);
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: true,
					authConfig: validAuthConfig.Auth!,
					tokens: authAPITestParams.ValidAuthTokens,
				})
			).rejects.toThrow(AuthError);
			credentialsForIdentityIdSpy.mockClear();
			credentialsForIdentityIdSpy.mockImplementationOnce(
				async ({}, params: GetCredentialsForIdentityInput) => {
					return authAPITestParams.NoCredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
				}
			);
			expect(
				cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: true,
					authConfig: validAuthConfig.Auth!,
					tokens: authAPITestParams.ValidAuthTokens,
				})
			).rejects.toThrow(AuthError);
			credentialsForIdentityIdSpy.mockClear();
			credentialsForIdentityIdSpy.mockImplementationOnce(
				async ({}, params: GetCredentialsForIdentityInput) => {
					return authAPITestParams.NoSecretKeyInCredentialsForIdentityIdResult as GetCredentialsForIdentityOutput;
				}
			);
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
