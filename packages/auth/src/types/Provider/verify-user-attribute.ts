import { AuthUser, AuthStateFlow } from './common';

export interface VerifyUserAttributeParams {
	user: AuthUser;
	attribute: string;
}

export type VerifyUserAttribute = (
	params: VerifyUserAttributeParams
) => Promise<AuthStateFlow>;
