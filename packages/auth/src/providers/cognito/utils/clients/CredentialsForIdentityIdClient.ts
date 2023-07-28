import { AmplifyV6 } from '@aws-amplify/core';
import { IdentityPoolHttpClient } from './HttpClients';
import {
	GetCredentialsForIdentityCommandOutput,
	GetCredentialsForIdentityCommandInput,
} from '@aws-sdk/client-cognito-identity';
export type CredentialsForIdentityIdClientInput = Pick<
	GetCredentialsForIdentityCommandInput,
	'IdentityId' | 'Logins'
>;

export async function credentialsForIdentityIdClient(
	params: CredentialsForIdentityIdClientInput
): Promise<GetCredentialsForIdentityCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new IdentityPoolHttpClient(authConfig);
	const result: GetCredentialsForIdentityCommandOutput =
		await client.send<GetCredentialsForIdentityCommandOutput>(
			'GetCredentialsForIdentity',
			{
				...params,
			}
		);
	return result;
}
