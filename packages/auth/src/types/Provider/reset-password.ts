import { AuthStateFlow } from './common';

export interface ResetPasswordParams {
	username: string;
	providerOptions: Record<string, any>;
}

export type ResetPassword = (
	params: ResetPasswordParams
) => Promise<AuthStateFlow>;
