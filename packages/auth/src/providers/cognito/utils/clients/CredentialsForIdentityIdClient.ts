import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';
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
	// TODO(V6): Update the region value
	const client = new UserPoolHttpClient('us-east-2', 'identity');
	const result: GetCredentialsForIdentityCommandOutput =
		await client.send<GetCredentialsForIdentityCommandOutput>(
			'GetCredentialsForIdentity',
			{
				...params,
			}
		);
	return result;
}
