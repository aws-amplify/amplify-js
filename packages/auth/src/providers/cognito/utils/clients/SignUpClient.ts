import type { SignUpCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';
import { SignUpClientInput } from './types/inputs';

export async function signUpClient(
	params: SignUpClientInput
): Promise<SignUpCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: SignUpCommandOutput = await client.send<SignUpCommandOutput>({
		operation: 'SignUp',
		input: {
			...params,
			ClientId: UserPoolClient.clientId,
		},
	});
	return result;
}
