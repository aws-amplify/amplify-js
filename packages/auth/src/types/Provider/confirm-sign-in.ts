export interface AuthConfirmSignInOptions {}

export interface ConfirmSignInParams {
	challengeResponse: string;
	options: AuthConfirmSignInOptions;
}

export interface AuthConfirmSignInResult {}

export type ConfirmSignIn = (
	params: ConfirmSignInParams
) => Promise<AuthConfirmSignInResult>;
