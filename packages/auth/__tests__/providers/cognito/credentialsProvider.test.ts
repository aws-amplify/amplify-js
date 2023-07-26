// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cognitoCredentialsProvider } from '../../../src/providers/cognito';
import { authAPITestParams } from './testUtils/authApiTestParams';

import {
	CredentialsForIdentityIdClientInput,
	credentialsForIdentityIdClient,
} from '../../../src/providers/cognito/utils/clients/CredentialsForIdentityIdClient';
import { GetCredentialsForIdentityCommandOutput } from '@aws-sdk/client-cognito-identity';

describe('Credentials Provider Happy Path Cases:', () => {
	let credentialsForidentityIdSpy;
	const { user1 } = authAPITestParams;
	beforeEach(() => {
		credentialsForidentityIdSpy = jest
			.spyOn<any, any>(
				credentialsForIdentityIdClient,
				'credentialsForIdentityIdClient'
			)
			.mockImplementationOnce(
				async (params: CredentialsForIdentityIdClientInput) => {
					return authAPITestParams.CredentialsForIdentityIdResult as GetCredentialsForIdentityCommandOutput;
				}
			);
	});
	afterEach(() => {
		credentialsForidentityIdSpy.mockClear();
	});
	test('Should return guest creds', async () => {
		const result = await cognitoCredentialsProvider.getCredentials({});
		expect(credentialsForidentityIdSpy).toBeCalledTimes(1);
	});
});
