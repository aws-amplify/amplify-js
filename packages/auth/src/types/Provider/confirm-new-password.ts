import { AuthStateFlow } from './common';

export interface ConfirmNewPasswordParams {
	state: AuthStateFlow;
	password: string;
	providerOptions: Record<string, any>;
}

export type ConfirmNewPassword = (
	params: ConfirmNewPasswordParams
) => Promise<AuthStateFlow>;
