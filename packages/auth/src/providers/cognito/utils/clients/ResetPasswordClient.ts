// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	ForgotPasswordCommandInput,
	ForgotPasswordCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';

export type ResetPasswordClientInput = Pick<
	ForgotPasswordCommandInput,
	'Username' | 'ClientMetadata'
>;

export async function resetPasswordClient(
	params: ResetPasswordClientInput
): Promise<ForgotPasswordCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);
	const result: ForgotPasswordCommandOutput =
		await client.send<ForgotPasswordCommandOutput>('ForgotPassword', {
			...params,
			ClientId: authConfig?.userPoolWebClientId,
		});
	return result;
}
