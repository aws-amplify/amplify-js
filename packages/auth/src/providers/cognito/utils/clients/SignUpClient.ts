import type {
	SignUpCommandInput,
	SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export type SignUpClientInput = Pick<
	SignUpCommandInput,
	| 'Username'
	| 'Password'
	| 'UserAttributes'
	| 'ClientMetadata'
	| 'ValidationData'
>;

export async function signUpClient(
	params: SignUpClientInput
): Promise<SignUpCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: SignUpCommandOutput = await client.send<SignUpCommandOutput>(
		'SignUp',
		{
			...params,
			ClientId: UserPoolClient.clientId,
		}
	);
	return result;
}
