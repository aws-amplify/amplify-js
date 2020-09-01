import { AuthSignInResult } from './common';

interface AuthSignInOptions {}

export interface SignInParams {
	username?: string;
	password?: string;
	options?: AuthSignInOptions;
}

export type SignIn = (params: SignInParams) => Promise<AuthSignInResult>;
