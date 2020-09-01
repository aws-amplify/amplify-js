import { AuthSignInResult } from './common';

export enum AuthUISocialProvider {}

export interface AuthSignInWithUIOptions {}

export interface SignInWithSocialUIParams {
	socialProvider: AuthUISocialProvider;
	options: AuthSignInWithUIOptions;
}

export type SignInWithSocialUI = (
	params?: SignInWithSocialUIParams
) => Promise<AuthSignInResult>;
