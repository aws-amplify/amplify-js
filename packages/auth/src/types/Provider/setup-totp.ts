import { AuthStateFlow } from './common';

export interface SetupTotpParams {
	authStateFlow: AuthStateFlow;
	providerOptions: Record<string, any>;
}

export type SetupTotp = (params: SetupTotpParams) => Promise<AuthStateFlow>;
