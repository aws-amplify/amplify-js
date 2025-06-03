// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ResourcesConfig,
	createGetCredentialsForIdentityClient,
	sharedInMemoryStorage,
} from '@aws-amplify/core';

import {
	CognitoAWSCredentialsAndIdentityIdProvider,
	DefaultIdentityIdStore,
} from '../../../../src/providers/cognito';
import { AuthError } from '../../../../src/errors/AuthError';
import { authAPITestParams } from '../testUtils/authApiTestParams';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	createGetCredentialsForIdentityClient: jest.fn(),
}));

jest.mock(
	'../../../../src/providers/cognito/credentialsProvider/IdentityIdProvider',
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

const mockCreateGetIdentityForIdentityClient = jest.mocked(
	createGetCredentialsForIdentityClient,
);

const mockGetCredentialsForIdentity: jest.MockedFunction<
	ReturnType<typeof createGetCredentialsForIdentityClient>
> = jest.fn(
	async (_config, _params) => authAPITestParams.CredentialsForIdentityIdResult,
);

describe('credentialsProvider', () => {
	beforeAll(() => {
		mockCreateGetIdentityForIdentityClient.mockReturnValue(
			mockGetCredentialsForIdentity,
		);
	});

	describe('Guest Credentials', () => {
		let cognitoCredentialsProvider: CognitoAWSCredentialsAndIdentityIdProvider;

		describe('Happy Path Cases:', () => {
			beforeEach(() => {
				const identityIdStore = new DefaultIdentityIdStore(
					sharedInMemoryStorage,
				);
				identityIdStore.setAuthConfig(validAuthConfig.Auth!);
				cognitoCredentialsProvider =
					new CognitoAWSCredentialsAndIdentityIdProvider(identityIdStore);
				mockGetCredentialsForIdentity.mockImplementationOnce(async () => {
					return authAPITestParams.CredentialsForIdentityIdResult;
				});
			});

			afterEach(() => {
				cognitoCredentialsProvider.clearCredentials();
				mockGetCredentialsForIdentity?.mockReset();
			});

			test('Should call identityIdClient with no logins to obtain guest creds', async () => {
				const res =
					await cognitoCredentialsProvider.getCredentialsAndIdentityId({
						authenticated: false,
						authConfig: validAuthConfig.Auth!,
					});
				expect(res?.credentials.accessKeyId).toEqual(
					authAPITestParams.CredentialsForIdentityIdResult.Credentials
						.AccessKeyId,
				);

				expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(1);
				expect(mockGetCredentialsForIdentity).toHaveBeenCalledWith(
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
				expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(1);
				const res =
					await cognitoCredentialsProvider.getCredentialsAndIdentityId({
						authenticated: false,
						authConfig: validAuthConfig.Auth!,
					});
				expect(res?.credentials.accessKeyId).toEqual(
					authAPITestParams.CredentialsForIdentityIdResult.Credentials
						.AccessKeyId,
				);
				// expecting to be called only once becasue in-memory creds should be returned
				expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(1);
			});
		});

		describe('Error Path Cases:', () => {
			beforeEach(() => {
				cognitoCredentialsProvider =
					new CognitoAWSCredentialsAndIdentityIdProvider(
						new DefaultIdentityIdStore(sharedInMemoryStorage),
					);
				mockGetCredentialsForIdentity.mockImplementationOnce(async () => {
					return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult;
				});
			});

			afterEach(() => {
				cognitoCredentialsProvider.clearCredentials();
			});
			afterAll(() => {
				mockGetCredentialsForIdentity?.mockReset();
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

			test('Should throw AuthError when there is a service error', async () => {
				expect.assertions(2);
				const mockServiceErrorParams = {
					name: 'ServiceUnavailable',
					message: '',
					metadata: {
						httpStatusCode: 500,
						requestId: '123',
					},
				};
				mockGetCredentialsForIdentity.mockReset();
				mockGetCredentialsForIdentity.mockRejectedValue(mockServiceErrorParams);
				try {
					await cognitoCredentialsProvider.getCredentialsAndIdentityId({
						authenticated: false,
						authConfig: validAuthConfig.Auth!,
					});
				} catch (e) {
					expect(e).toBeInstanceOf(AuthError);
					expect(e).toMatchObject(mockServiceErrorParams);
				}
			});
		});
	});

	describe('Primary Credentials', () => {
		let cognitoCredentialsProvider: CognitoAWSCredentialsAndIdentityIdProvider;
		describe('Happy Path Cases:', () => {
			beforeEach(() => {
				const identityIdStore = new DefaultIdentityIdStore(
					sharedInMemoryStorage,
				);
				identityIdStore.setAuthConfig(validAuthConfig.Auth!);
				cognitoCredentialsProvider =
					new CognitoAWSCredentialsAndIdentityIdProvider(identityIdStore);
				mockGetCredentialsForIdentity.mockImplementation(async () => {
					return authAPITestParams.CredentialsForIdentityIdResult;
				});
			});

			afterEach(() => {
				cognitoCredentialsProvider.clearCredentials();
				mockGetCredentialsForIdentity?.mockReset();
			});

			test('Should call identityIdClient with the logins map to obtain primary creds', async () => {
				const res =
					await cognitoCredentialsProvider.getCredentialsAndIdentityId({
						authenticated: true,
						authConfig: validAuthConfig.Auth!,
						tokens: authAPITestParams.ValidAuthTokens,
					});
				expect(res).toMatchObject({
					credentials: {
						accessKeyId:
							authAPITestParams.CredentialsForIdentityIdResult.Credentials
								.AccessKeyId,
						expiration:
							authAPITestParams.CredentialsForIdentityIdResult.Credentials
								.Expiration,
						secretAccessKey:
							authAPITestParams.CredentialsForIdentityIdResult.Credentials
								.SecretKey,
						sessionToken:
							authAPITestParams.CredentialsForIdentityIdResult.Credentials
								.SessionToken,
					},
					identityId:
						authAPITestParams.CredentialsForIdentityIdResult.IdentityId,
				});

				expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(1);
			});

			test('in-memory primary creds are returned if not expired and not past TTL', async () => {
				await cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: true,
					authConfig: validAuthConfig.Auth!,
					tokens: authAPITestParams.ValidAuthTokens,
				});
				expect(mockGetCredentialsForIdentity).toHaveBeenCalledWith(
					{
						region: authAPITestParams.CredentialsClientRequest.region,
					},
					authAPITestParams.CredentialsClientRequest.withValidAuthToken,
				);
				expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(1);

				const res =
					await cognitoCredentialsProvider.getCredentialsAndIdentityId({
						authenticated: true,
						authConfig: validAuthConfig.Auth!,
						tokens: authAPITestParams.ValidAuthTokens,
					});
				expect(res?.credentials.accessKeyId).toEqual(
					authAPITestParams.CredentialsForIdentityIdResult.Credentials
						.AccessKeyId,
				);
				// expecting to be called only once becasue in-memory creds should be returned
				expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(1);
			});

			test('Should get new credentials when tokens have changed', async () => {
				await cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: true,
					authConfig: validAuthConfig.Auth!,
					tokens: authAPITestParams.ValidAuthTokens,
				});
				expect(mockGetCredentialsForIdentity).toHaveBeenCalledWith(
					{
						region: authAPITestParams.CredentialsClientRequest.region,
					},
					authAPITestParams.CredentialsClientRequest.withValidAuthToken,
				);
				expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(1);

				await cognitoCredentialsProvider.getCredentialsAndIdentityId({
					authenticated: true,
					authConfig: validAuthConfig.Auth!,
					tokens: authAPITestParams.NewValidAuthTokens,
				});
				expect(mockGetCredentialsForIdentity).toHaveBeenCalledWith(
					{
						region: authAPITestParams.CredentialsClientRequest.region,
					},
					authAPITestParams.CredentialsClientRequest.withNewValidAuthToken,
				);
				expect(mockGetCredentialsForIdentity).toHaveBeenCalledTimes(2);
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
				mockGetCredentialsForIdentity?.mockReset();
			});

			test('Should throw AuthError if either Credentials, accessKeyId or secretKey is absent in the response', async () => {
				mockGetCredentialsForIdentity.mockImplementationOnce(async () => {
					return authAPITestParams.NoAccessKeyCredentialsForIdentityIdResult;
				});
				expect(
					cognitoCredentialsProvider.getCredentialsAndIdentityId({
						authenticated: true,
						authConfig: validAuthConfig.Auth!,
						tokens: authAPITestParams.ValidAuthTokens,
					}),
				).rejects.toThrow(AuthError);
				mockGetCredentialsForIdentity.mockClear();
				mockGetCredentialsForIdentity.mockImplementationOnce(async () => {
					return authAPITestParams.NoCredentialsForIdentityIdResult;
				});
				expect(
					cognitoCredentialsProvider.getCredentialsAndIdentityId({
						authenticated: true,
						authConfig: validAuthConfig.Auth!,
						tokens: authAPITestParams.ValidAuthTokens,
					}),
				).rejects.toThrow(AuthError);
				mockGetCredentialsForIdentity.mockClear();
				mockGetCredentialsForIdentity.mockImplementationOnce(async () => {
					return authAPITestParams.NoSecretKeyInCredentialsForIdentityIdResult;
				});
				expect(
					cognitoCredentialsProvider.getCredentialsAndIdentityId({
						authenticated: true,
						authConfig: validAuthConfig.Auth!,
						tokens: authAPITestParams.ValidAuthTokens,
					}),
				).rejects.toThrow(AuthError);
			});

			test('Should throw AuthError when there is a service error', async () => {
				expect.assertions(2);
				const mockServiceErrorParams = {
					name: 'ServiceUnavailable',
					message: '',
					metadata: {
						httpStatusCode: 500,
						requestId: '123',
					},
				};
				mockGetCredentialsForIdentity.mockReset();
				mockGetCredentialsForIdentity.mockRejectedValue(mockServiceErrorParams);
				try {
					await cognitoCredentialsProvider.getCredentialsAndIdentityId({
						authenticated: true,
						authConfig: validAuthConfig.Auth!,
						tokens: authAPITestParams.ValidAuthTokens,
					});
				} catch (e) {
					expect(e).toBeInstanceOf(AuthError);
					expect(e).toMatchObject(mockServiceErrorParams);
				}
			});
		});
	});
});
