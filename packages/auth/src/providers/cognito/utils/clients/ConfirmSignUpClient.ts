// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	ConfirmSignUpCommandInput,
	ConfirmSignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';
export type ConfirmSignUpClientInput = Pick<
	ConfirmSignUpCommandInput,
	| 'Username'
	| 'ClientMetadata'
	| 'ConfirmationCode'
	| 'ForceAliasCreation'
	| 'UserContextData'
>;

export async function confirmSignUpClient(
	params: ConfirmSignUpClientInput
): Promise<ConfirmSignUpCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);
	return client.send<ConfirmSignUpCommandOutput>('ConfirmSignUp', {
		...params,
		ClientId: authConfig?.userPoolWebClientId,
	});
}
