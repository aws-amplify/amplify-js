import { Logger } from '@aws-amplify/core';
import { Failure, Result } from './credentialsProvider';

const logger = new Logger('Credentials');

type AuthUserSession = {};

export type CognitoUserPoolTokens = {};
export type AuthCredentials = {};
export type AWSCredentials = {};
export type AuthSession = {};

export interface AuthTokensProvider {
	getAuthTokens: (
		options?: GetAuthTokensOptions
	) => Promise<Result<AuthTokens, Error>>;
}

type GetAuthTokensOptions = {
	forceRefresh?: boolean;
};

type AuthTokens = {
	idToken: string;
	accessToken: string;
	refreshToken?: string;
};

export class CognitoAuthTokensProvider implements AuthTokensProvider {
	getAuthTokens(
		options?: GetAuthTokensOptions
	): Promise<Result<AWSCognitoAuthTokens, Error>> {
		const res: Failure<Error> = {
			error: new Error('No Auth tokens found.'),
		};
		return Promise.resolve(res);
	}
}

class AWSCognitoAuthTokens implements AuthTokens {
	idToken: string;
	accessToken: string;
	refreshToken: string;
}
