import { IdentityPoolHttpClient } from './HttpClients';
import {
	GetIdCommandOutput,
	GetIdCommandInput,
} from '@aws-sdk/client-cognito-identity';
import { AmplifyV6 } from '@aws-amplify/core';

export type IdentityIdForPoolIdClientInput = Pick<
	GetIdCommandInput,
	'IdentityPoolId' | 'Logins'
>;

export async function getIdClient(
	params: IdentityIdForPoolIdClientInput
): Promise<GetIdCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new IdentityPoolHttpClient(authConfig);
	const result: GetIdCommandOutput = await client.send<GetIdCommandOutput>(
		'GetId',
		{
			...params,
		}
	);
	return result;
}
