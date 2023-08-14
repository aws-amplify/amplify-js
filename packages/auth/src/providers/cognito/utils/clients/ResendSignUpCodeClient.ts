// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	ResendConfirmationCodeCommandInput,
	ResendConfirmationCodeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';

export type ResendConfirmationCodeClientInput = Pick<
	ResendConfirmationCodeCommandInput,
	'Username' | 'ClientMetadata'
>;

export async function resendSignUpConfirmationCodeClient(
	params: ResendConfirmationCodeClientInput
): Promise<ResendConfirmationCodeCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);
	const result: ResendConfirmationCodeCommandOutput =
		await client.send<ResendConfirmationCodeCommandOutput>(
			'ResendConfirmationCode',
			{
				...params,
				ClientId: authConfig?.userPoolWebClientId,
			}
		);
	return result;
}
