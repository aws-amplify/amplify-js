import { AuthStateFlow } from './common';

export interface VerifyTotpTokenParams {
	authStateFlow: AuthStateFlow;
	providerOptions: Record<string, any>;
}

export type VerifyTotpToken = (
	params: VerifyTotpTokenParams
) => Promise<AuthStateFlow>;
