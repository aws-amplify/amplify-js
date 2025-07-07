// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	Identity,
	ResourcesConfig,
	createGetIdClient,
} from '@aws-amplify/core';
import {
	AmplifyError,
	CognitoIdentityPoolConfig,
} from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../../src/errors/AuthError';
import { DefaultIdentityIdStore } from '../../../../src/providers/cognito/credentialsProvider/IdentityIdStore';
import { cognitoIdentityIdProvider } from '../../../../src/providers/cognito/credentialsProvider/IdentityIdProvider';
import { authAPITestParams } from '../testUtils/authApiTestParams';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	createGetIdClient: jest.fn(),
}));
jest.mock(
	'../../../../src/providers/cognito/credentialsProvider/IdentityIdStore',
);

const ampConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1:test-id',
			userPoolClientId: 'test-id',
			identityPoolId: 'us-east-1:test-id',
		},
	},
};

const mockCreateGetIdClient = jest.mocked(createGetIdClient);
const mockKeyValueStorage = {
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};
const MockDefaultIdentityIdStore = DefaultIdentityIdStore as jest.Mock;

describe('Cognito IdentityId Provider', () => {
	const _ = new DefaultIdentityIdStore(mockKeyValueStorage);
	const mockDefaultIdentityIdStoreInstance =
		MockDefaultIdentityIdStore.mock.instances[0];
	const mockGetId: jest.MockedFunction<ReturnType<typeof createGetIdClient>> =
		jest.fn(async (_config, params) => {
			if (params.Logins && Object.keys(params.Logins).length === 0) {
				return {
					IdentityId: authAPITestParams.GuestIdentityId.id,
					$metadata: {},
				};
			} else {
				return {
					IdentityId: authAPITestParams.PrimaryIdentityId.id,
					$metadata: {},
				};
			}
		});

	describe('Happy Path Cases:', () => {
		beforeAll(() => {
			jest.spyOn(Amplify, 'getConfig').mockImplementationOnce(() => ampConfig);

			mockCreateGetIdClient.mockReturnValue(mockGetId);
		});

		afterEach(() => {
			mockGetId.mockClear();
		});

		test('Should return stored guest identityId', async () => {
			mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
				async () => {
					return authAPITestParams.GuestIdentityId as Identity;
				},
			);
			expect(
				await cognitoIdentityIdProvider({
					authConfig: ampConfig.Auth!.Cognito as CognitoIdentityPoolConfig,
					identityIdStore: mockDefaultIdentityIdStoreInstance,
				}),
			).toBe(authAPITestParams.GuestIdentityId.id);
			expect(mockGetId).toHaveBeenCalledTimes(0);
		});
		test('Should generate a guest identityId and return it', async () => {
			mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
				async () => {
					return undefined;
				},
			);
			mockDefaultIdentityIdStoreInstance.storeIdentityId.mockImplementationOnce(
				async (identity: Identity) => {
					expect(identity.id).toBe(authAPITestParams.GuestIdentityId.id);
					expect(identity.type).toBe(authAPITestParams.GuestIdentityId.type);
				},
			);
			expect(
				await cognitoIdentityIdProvider({
					authConfig: {
						identityPoolId: 'us-east-1:test-id',
					},
					identityIdStore: mockDefaultIdentityIdStoreInstance,
				}),
			).toBe(authAPITestParams.GuestIdentityId.id);
			expect(mockGetId).toHaveBeenCalledTimes(1);
		});
		test('Should return stored primary identityId', async () => {
			mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
				async () => {
					return authAPITestParams.PrimaryIdentityId as Identity;
				},
			);
			expect(
				await cognitoIdentityIdProvider({
					authConfig: ampConfig.Auth!.Cognito as CognitoIdentityPoolConfig,
					tokens: authAPITestParams.ValidAuthTokens,
					identityIdStore: mockDefaultIdentityIdStoreInstance,
				}),
			).toBe(authAPITestParams.PrimaryIdentityId.id);
			expect(mockGetId).toHaveBeenCalledTimes(0);
		});
		test('Should generate a primary identityId and return it', async () => {
			mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
				async () => {
					return undefined;
				},
			);
			mockDefaultIdentityIdStoreInstance.storeIdentityId.mockImplementationOnce(
				async (identity: Identity) => {
					expect(identity.id).toBe(authAPITestParams.PrimaryIdentityId.id);
					expect(identity.type).toBe(authAPITestParams.PrimaryIdentityId.type);
				},
			);
			expect(
				await cognitoIdentityIdProvider({
					tokens: authAPITestParams.ValidAuthTokens,
					authConfig: {
						identityPoolId: 'us-east-1:test-id',
					},
					identityIdStore: mockDefaultIdentityIdStoreInstance,
				}),
			).toBe(authAPITestParams.PrimaryIdentityId.id);
			expect(mockGetId).toHaveBeenCalledTimes(1);
		});
	});

	test('Should return the identityId irresspective of the type if present', async () => {
		mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
			async () => {
				return authAPITestParams.PrimaryIdentityId as Identity;
			},
		);
		expect(
			await cognitoIdentityIdProvider({
				tokens: authAPITestParams.ValidAuthTokens,
				authConfig: {
					identityPoolId: 'XXXXXXXXXXXXXXXXX',
				},
				identityIdStore: mockDefaultIdentityIdStoreInstance,
			}),
		).toBe(authAPITestParams.PrimaryIdentityId.id);

		mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
			async () => {
				return authAPITestParams.GuestIdentityId as Identity;
			},
		);
		expect(
			await cognitoIdentityIdProvider({
				tokens: authAPITestParams.ValidAuthTokens,
				authConfig: {
					identityPoolId: 'XXXXXXXXXXXXXXXXX',
				},
				identityIdStore: mockDefaultIdentityIdStoreInstance,
			}),
		).toBe(authAPITestParams.GuestIdentityId.id);
		expect(mockGetId).toHaveBeenCalledTimes(0);
	});

	test('Should fetch from Cognito when there is no identityId cached', async () => {
		mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
			async () => {
				return undefined;
			},
		);
		mockDefaultIdentityIdStoreInstance.storeIdentityId.mockImplementationOnce(
			async (identity: Identity) => {
				expect(identity.id).toBe(authAPITestParams.PrimaryIdentityId.id);
				expect(identity.type).toBe(authAPITestParams.PrimaryIdentityId.type);
			},
		);
		expect(
			await cognitoIdentityIdProvider({
				tokens: authAPITestParams.ValidAuthTokens,
				authConfig: {
					identityPoolId: 'us-east-1:test-id',
				},
				identityIdStore: mockDefaultIdentityIdStoreInstance,
			}),
		).toBe(authAPITestParams.PrimaryIdentityId.id);
		expect(mockGetId).toHaveBeenCalledTimes(1);
	});

	describe('Error Path Cases', () => {
		const mockServiceErrorParams = {
			name: 'ServiceError',
			message: '',
			metadata: {
				httpStatusCode: 500,
				requestId: '123',
			},
		};
		beforeEach(() => {
			mockGetId.mockRejectedValue(new AmplifyError(mockServiceErrorParams));
		});

		test('Should throw AuthError when there is a service error', async () => {
			expect.assertions(2);
			mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
				async () => {
					return undefined;
				},
			);
			try {
				await cognitoIdentityIdProvider({
					authConfig: ampConfig.Auth!.Cognito as CognitoIdentityPoolConfig,
					identityIdStore: mockDefaultIdentityIdStoreInstance,
				});
			} catch (e) {
				expect(e).toBeInstanceOf(AuthError);
				expect(e).toMatchObject(mockServiceErrorParams);
			}
		});
	});
});
