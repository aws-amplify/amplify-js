import { Logger } from '@aws-amplify/core';
import { CognitoCredentialsProvider } from './credentialsProvider';
import {
	AWSCredentials,
	AuthSession,
	CognitoAuthTokensProvider,
	CognitoUserPoolTokens,
} from './tokensProvider';

export async function fetchAuthSession(
	req?: FetchAuthSessionRequest
): Promise<AWSCognitoAuthSession> {
	const tokensProvider = new CognitoAuthTokensProvider();
	const credentialsProvider = new CognitoCredentialsProvider();
	throw new Error('Function not implemented.');
}

type FetchAuthSessionRequest = { options?: { forceRefresh?: boolean } };

class AWSCognitoAuthSession implements AuthSession {
	credentials: AWSCredentials;
	userPoolTokens: CognitoUserPoolTokens;
	userSub: string;
	identityId: string;
}
