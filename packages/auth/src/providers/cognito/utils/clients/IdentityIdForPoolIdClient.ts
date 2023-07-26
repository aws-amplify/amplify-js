import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';
import {
	GetIdCommandOutput,
	GetIdCommandInput,
} from '@aws-sdk/client-cognito-identity';
export type IdentityIdForPoolIdClientInput = Pick<
	GetIdCommandInput,
	'IdentityPoolId' | 'Logins'
>;

export async function getIdClient(
	params: IdentityIdForPoolIdClientInput
): Promise<GetIdCommandOutput> {
	// TODO(V6): Update the region value
	const client = new UserPoolHttpClient('us-east-2', 'identity');
	const result: GetIdCommandOutput = await client.send<GetIdCommandOutput>(
		'GetId',
		{
			...params,
		}
	);
	return result;
}
