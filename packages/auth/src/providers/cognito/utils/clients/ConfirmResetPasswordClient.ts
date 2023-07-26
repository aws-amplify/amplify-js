// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ConfirmForgotPasswordCommandInput,
	ConfirmForgotPasswordCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';

export type ConfirmResetPasswordClientInput = Pick<
	ConfirmForgotPasswordCommandInput,
	'Username' | 'ConfirmationCode' | 'Password' | 'ClientMetadata'
>;

export async function confirmResetPasswordClient(
	params: ConfirmResetPasswordClientInput
): Promise<ConfirmForgotPasswordCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);
	const result: ConfirmForgotPasswordCommandOutput =
		await client.send<ConfirmForgotPasswordCommandOutput>(
			'ConfirmForgotPassword',
			{
				...params,
				ClientId: authConfig?.userPoolWebClientId,
			}
		);
	return result;
}
