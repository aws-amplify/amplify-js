import { AuthSignInResult } from './common';

interface AuthUITokenProvider {}

interface AuthSignInWithSocialTokenOptions {}

export interface SignInWithSocialTokenParams {
	socialProvider: AuthUITokenProvider;
	token: string;
	options?: AuthSignInWithSocialTokenOptions;
}

export type SignInWithSocialToken = (
	params: SignInWithSocialTokenParams
) => Promise<AuthSignInResult>;
