import { CognitoCredentialsProvider } from './credentialsProvider';
import {
	Logger,
	AuthCredentialsProvider,
	AWSTemporaryCredentials,
} from '@aws-amplify/core';

export async function fetchAuthSession(
	req?: FetchAuthSessionRequest
): Promise<AWSCognitoAuthSession> {
	// const tokensProvider = new CognitoAuthTokensProvider();
	const credentialsProvider = new CognitoCredentialsProvider();
	throw new Error('Function not implemented.');
}

type FetchAuthSessionRequest = { options?: { forceRefresh?: boolean } };

class AWSCognitoAuthSession {
	credentials: AWSTemporaryCredentials;
	userPoolTokens: string;
	userSub: string;
	identityId: string;
}
