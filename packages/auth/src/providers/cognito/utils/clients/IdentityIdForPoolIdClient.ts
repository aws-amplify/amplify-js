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
	const client = new UserPoolHttpClient(UserPoolClient.region, 'identity');
	const result: GetIdCommandOutput = await client.send<GetIdCommandOutput>(
		'GetId',
		{
			...params,
		}
	);
	return result;
}
