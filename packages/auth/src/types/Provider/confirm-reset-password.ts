import { AuthStateFlow } from './common';

export interface ConfirmResetPasswordParams {
	username: string;
	code: string;
	providerOptions: Record<string, any>;
}

export type ConfirmResetPassword = (
	params: ConfirmResetPasswordParams
) => Promise<AuthStateFlow>;
