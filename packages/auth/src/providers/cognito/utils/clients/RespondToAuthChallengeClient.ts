import type { RespondToAuthChallengeCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';
import { RespondToAuthChallengeClientInput } from './types/inputs';

export async function respondToAuthChallengeClient(
	params: RespondToAuthChallengeClientInput
): Promise<RespondToAuthChallengeCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: RespondToAuthChallengeCommandOutput =
		await client.send<RespondToAuthChallengeCommandOutput>({
			operation: 'RespondToAuthChallenge',
			input: {
				...params,
				ClientId: UserPoolClient.clientId,
			},
		});
	return result;
}
