// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { authAPITestParams } from './testUtils/authApiTestParams';
import { Amplify, Identity, ResourcesConfig } from '@aws-amplify/core';
import { DefaultIdentityIdStore } from '../../../src/providers/cognito/credentialsProvider/IdentityIdStore';

// TODO(V6): import these from top level core/ and not lib/
import * as cogId from '@aws-amplify/core/lib/AwsClients/CognitoIdentity';
import { cognitoIdentityIdProvider } from '../../../src/providers/cognito/credentialsProvider/IdentityIdProvider';
jest.mock('@aws-amplify/core/lib/AwsClients/CognitoIdentity');
jest.mock('../../../src/providers/cognito/credentialsProvider/IdentityIdStore');

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
	? A
	: never;
const ampConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1:test-id',
			userPoolClientId: 'test-id',
			identityPoolId: 'us-east-1:test-id',
		},
	},
};

const getIdClientSpy = jest.spyOn(cogId, 'getId');
const mockKeyValueStorage = {
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};
const MockDefaultIdentityIdStore = DefaultIdentityIdStore as jest.Mock;

describe('Cognito IdentityId Provider Happy Path Cases:', () => {
	const _ = new DefaultIdentityIdStore(mockKeyValueStorage);
	const mockDefaultIdentityIdStoreInstance =
		MockDefaultIdentityIdStore.mock.instances[0];

	beforeAll(() => {
		jest.spyOn(Amplify, 'getConfig').mockImplementationOnce(() => ampConfig);

		getIdClientSpy.mockImplementation(
			async (config: {}, params: cogId.GetIdInput) => {
				if (params.Logins && Object.keys(params.Logins).length === 0) {
					return {
						IdentityId: authAPITestParams.GuestIdentityId.id,
					} as cogId.GetIdOutput;
				} else {
					return {
						IdentityId: authAPITestParams.PrimaryIdentityId.id,
					} as cogId.GetIdOutput;
				}
			}
		);
	});
	test('Should return stored guest identityId', async () => {
		mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
			async () => {
				return authAPITestParams.GuestIdentityId as Identity;
			}
		);
		expect(
			await cognitoIdentityIdProvider({
				identityIdStore: mockDefaultIdentityIdStoreInstance,
			})
		).toBe(authAPITestParams.GuestIdentityId.id);
		expect(getIdClientSpy).toBeCalledTimes(0);
	});
	test('Should generate a guest identityId and return it', async () => {
		mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
			async () => {
				return undefined;
			}
		);
		mockDefaultIdentityIdStoreInstance.storeIdentityId.mockImplementationOnce(
			async (identity: Identity) => {
				expect(identity.id).toBe(authAPITestParams.GuestIdentityId.id);
				expect(identity.type).toBe(authAPITestParams.GuestIdentityId.type);
			}
		);
		expect(
			await cognitoIdentityIdProvider({
				authConfig: {
					identityPoolId: 'us-east-1:test-id',
				},
				identityIdStore: mockDefaultIdentityIdStoreInstance,
			})
		).toBe(authAPITestParams.GuestIdentityId.id);
		expect(getIdClientSpy).toBeCalledTimes(1);
	});
	test('Should return stored primary identityId', async () => {
		mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
			async () => {
				return authAPITestParams.PrimaryIdentityId as Identity;
			}
		);
		expect(
			await cognitoIdentityIdProvider({
				tokens: authAPITestParams.ValidAuthTokens,
				identityIdStore: mockDefaultIdentityIdStoreInstance,
			})
		).toBe(authAPITestParams.PrimaryIdentityId.id);
		expect(getIdClientSpy).toBeCalledTimes(0);
	});
	test('Should generate a primary identityId and return it', async () => {
		mockDefaultIdentityIdStoreInstance.loadIdentityId.mockImplementationOnce(
			async () => {
				return undefined;
			}
		);
		mockDefaultIdentityIdStoreInstance.storeIdentityId.mockImplementationOnce(
			async (identity: Identity) => {
				expect(identity.id).toBe(authAPITestParams.PrimaryIdentityId.id);
				expect(identity.type).toBe(authAPITestParams.PrimaryIdentityId.type);
			}
		);
		expect(
			await cognitoIdentityIdProvider({
				tokens: authAPITestParams.ValidAuthTokens,
				authConfig: {
					identityPoolId: 'us-east-1:test-id',
				},
				identityIdStore: mockDefaultIdentityIdStoreInstance,
			})
		).toBe(authAPITestParams.PrimaryIdentityId.id);
		expect(getIdClientSpy).toBeCalledTimes(1);
	});
});
