import { MfaOption, AuthUser, AuthStateFlow } from './common';

export interface UpdatePreferredMfaParams {
	user: AuthUser;
	mfaOption: MfaOption;
}

export type UpdatePreferredMfa = (
	params: UpdatePreferredMfaParams
) => Promise<AuthStateFlow>;
