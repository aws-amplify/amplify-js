// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cognitoIdentityIdProvider } from '../../../src/providers/cognito';
import { authAPITestParams } from './testUtils/authApiTestParams';

import * as client from '../../../src/providers/cognito/utils/clients/IdentityIdForPoolIdClient';
import { GetIdCommandOutput } from '@aws-sdk/client-cognito-identity';
import { AmplifyV6, Identity, defaultIdentityIdStore } from '@aws-amplify/core';

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
	? A
	: never;
const ampConfig: ArgumentTypes<typeof AmplifyV6.configure>[0] = {
	Auth: {
		userPoolId: 'us-east-1:aaaaaaa',
		userPoolWebClientId: 'aaaaaaaaaaaa',
		identityPoolId: 'us-east-1:aaaaaaa',
	},
};

describe('Cognito IdentityId Provider Happy Path Cases:', () => {
	let getIdClientSpy;
	beforeAll(() => {
		jest.spyOn(AmplifyV6, 'getConfig').mockImplementationOnce(() => ampConfig);
		getIdClientSpy = jest
			.spyOn(client, 'getIdClient')
			.mockImplementation(
				async (params: client.IdentityIdForPoolIdClientInput) => {
					if (params.Logins && Object.keys(params.Logins).length === 0) {
						return {
							IdentityId: authAPITestParams.GuestIdentityId.id,
						} as GetIdCommandOutput;
					} else {
						return {
							IdentityId: authAPITestParams.PrimaryIdentityId.id,
						} as GetIdCommandOutput;
					}
				}
			);
	});
	test('Should return stored guest identityId', async () => {
		jest
			.spyOn(defaultIdentityIdStore, 'loadIdentityId')
			.mockImplementationOnce(async () => {
				return authAPITestParams.GuestIdentityId as Identity;
			});
		expect(await cognitoIdentityIdProvider({})).toBe(
			authAPITestParams.GuestIdentityId.id
		);
		expect(getIdClientSpy).toBeCalledTimes(0);
	});
	test('Should generate a guest identityId and return it', async () => {
		jest
			.spyOn(defaultIdentityIdStore, 'loadIdentityId')
			.mockImplementationOnce(async () => {
				return undefined;
			});
		jest
			.spyOn(defaultIdentityIdStore, 'storeIdentityId')
			.mockImplementationOnce(async (identity: Identity) => {
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
		jest
			.spyOn(defaultIdentityIdStore, 'loadIdentityId')
			.mockImplementationOnce(async () => {
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
		jest
			.spyOn(defaultIdentityIdStore, 'loadIdentityId')
			.mockImplementationOnce(async () => {
				return undefined;
			});
		jest
			.spyOn(defaultIdentityIdStore, 'storeIdentityId')
			.mockImplementationOnce(async (identity: Identity) => {
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
