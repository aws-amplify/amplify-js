// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cognitoCredentialsProvider } from '../../../src/providers/cognito';
import { authAPITestParams } from './testUtils/authApiTestParams';

import * as client from '../../../src/providers/cognito/utils/clients/CredentialsForIdentityIdClient';
import { GetCredentialsForIdentityCommandOutput } from '@aws-sdk/client-cognito-identity';

describe('Credentials Provider Happy Path Cases:', () => {
	let credentialsForidentityIdSpy;
	const { user1 } = authAPITestParams;
	beforeEach(() => {});
	afterEach(() => {
		credentialsForidentityIdSpy.mockClear();
		cognitoCredentialsProvider.clearCredentials();
	});
	test('Should call identityIdClient with no logins to obtain guest creds', async () => {
		credentialsForidentityIdSpy = jest
			.spyOn(client, 'credentialsForIdentityIdClient')
			.mockImplementationOnce(
				async (params: client.CredentialsForIdentityIdClientInput) => {
					expect(params.Logins).toBeUndefined();
					return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityCommandOutput;
				}
			);
		const creds = await cognitoCredentialsProvider.getCredentials({
			identityId: 'test',
		});
		expect(creds.accessKeyId).toEqual(
			authAPITestParams.CredentialsForIdentityIdResult.Credentials.AccessKeyId
		);

		expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
	});
	test('in-memory creds are returned if not expired and not past TTL', async () => {
		credentialsForidentityIdSpy = jest
			.spyOn(client, 'credentialsForIdentityIdClient')
			.mockImplementationOnce(
				async (params: client.CredentialsForIdentityIdClientInput) => {
					return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityCommandOutput;
				}
			);
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
