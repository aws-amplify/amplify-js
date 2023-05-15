import type {
	RespondToAuthChallengeCommandInput,
	RespondToAuthChallengeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export type RespondToAuthChallengeClientInput = Pick<
	RespondToAuthChallengeCommandInput,
	'ChallengeName' | 'ChallengeResponses' | 'ClientMetadata' | 'Session'
>;

export async function respondToAuthChallengeClient(
	params: RespondToAuthChallengeClientInput
): Promise<RespondToAuthChallengeCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	const result: RespondToAuthChallengeCommandOutput =
		await client.send<RespondToAuthChallengeCommandOutput>(
			'RespondToAuthChallenge',
			{
				...params,
				ClientId: UserPoolClient.clientId,
			}
		);
	return result;
}
