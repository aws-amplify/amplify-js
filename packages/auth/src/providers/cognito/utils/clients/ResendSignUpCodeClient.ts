import {
	ResendConfirmationCodeCommandInput,
	ResendConfirmationCodeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export type ResendConfirmationCodeClientInput = Pick<
	ResendConfirmationCodeCommandInput,
	'Username' | 'ClientMetadata'
>;

export async function resendSignUpConfirmationCodeClient(
	params: ResendConfirmationCodeClientInput
): Promise<ResendConfirmationCodeCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: ResendConfirmationCodeCommandOutput =
		await client.send<ResendConfirmationCodeCommandOutput>(
			'ResendSignUpConfirmationCode',
			{
				...params,
				ClientId: UserPoolClient.clientId,
			}
		);
	return result;
}
