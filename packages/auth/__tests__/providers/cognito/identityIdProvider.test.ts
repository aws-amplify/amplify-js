// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { authAPITestParams } from './testUtils/authApiTestParams';
import { AmplifyV6, Identity } from '@aws-amplify/core';

// TODO(V6): import these from top level core/ and not lib/
import * as cogId from '@aws-amplify/core/lib/AwsClients/CognitoIdentity';
import { cognitoIdentityIdProvider } from '../../../src/providers/cognito/credentialsProvider/IdentityIdProvider';
import { defaultIdentityIdStore } from '../../../src/providers/cognito/credentialsProvider';
jest.mock('@aws-amplify/core/lib/AwsClients/CognitoIdentity');

const loadIdentityIdSpy = jest.spyOn(defaultIdentityIdStore, 'loadIdentityId');

const storeIdentityIdSpy = jest.spyOn(
	defaultIdentityIdStore,
	'storeIdentityId'
);

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
	? A
	: never;
const ampConfig: ArgumentTypes<typeof AmplifyV6.configure>[0] = {
	Auth: {
		userPoolId: 'us-east-1:test-id',
		userPoolWebClientId: 'test-id',
		identityPoolId: 'us-east-1:test-id',
	},
};
const getIdClientSpy = jest.spyOn(cogId, 'getId');
describe('Cognito IdentityId Provider Happy Path Cases:', () => {
	beforeAll(() => {
		jest.spyOn(AmplifyV6, 'getConfig').mockImplementationOnce(() => ampConfig);

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
		loadIdentityIdSpy.mockImplementationOnce(async () => {
			return authAPITestParams.GuestIdentityId as Identity;
		});
		expect(await cognitoIdentityIdProvider({})).toBe(
			authAPITestParams.GuestIdentityId.id
		);
		expect(getIdClientSpy).toBeCalledTimes(0);
	});
	test('Should generate a guest identityId and return it', async () => {
		loadIdentityIdSpy.mockImplementationOnce(async () => {
			return undefined;
		});
		storeIdentityIdSpy.mockImplementationOnce(async (identity: Identity) => {
			expect(identity.id).toBe(authAPITestParams.GuestIdentityId.id);
			expect(identity.type).toBe(authAPITestParams.GuestIdentityId.type);
		});
		expect(
			await cognitoIdentityIdProvider({
				authConfig: ampConfig.Auth,
			})
		).toBe(authAPITestParams.GuestIdentityId.id);
		expect(getIdClientSpy).toBeCalledTimes(1);
	});
	test('Should return stored primary identityId', async () => {
		loadIdentityIdSpy.mockImplementationOnce(async () => {
			return authAPITestParams.PrimaryIdentityId as Identity;
		});
		expect(
			await cognitoIdentityIdProvider({
				tokens: authAPITestParams.ValidAuthTokens,
			})
		).toBe(authAPITestParams.PrimaryIdentityId.id);
		expect(getIdClientSpy).toBeCalledTimes(0);
	});
	test('Should generate a primary identityId and return it', async () => {
		loadIdentityIdSpy.mockImplementationOnce(async () => {
			return undefined;
		});
		storeIdentityIdSpy.mockImplementationOnce(async (identity: Identity) => {
			expect(identity.id).toBe(authAPITestParams.PrimaryIdentityId.id);
			expect(identity.type).toBe(authAPITestParams.PrimaryIdentityId.type);
		});
		expect(
			await cognitoIdentityIdProvider({
				tokens: authAPITestParams.ValidAuthTokens,
				authConfig: ampConfig.Auth,
			})
		).toBe(authAPITestParams.PrimaryIdentityId.id);
		expect(getIdClientSpy).toBeCalledTimes(1);
	});
});
