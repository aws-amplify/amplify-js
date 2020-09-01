import { AuthSignUpOptions, AuthSignUpResult } from './common';

export interface ConfirmSignUpParams {
	username: string;
	code: string;
	options?: AuthSignUpOptions;
}

export type ConfirmSignUp = (
	params: ConfirmSignUpParams
) => Promise<AuthSignUpResult>;
