import { AuthStateFlow, AuthUser } from './common';

export interface ConfirmVerifyUserAttributeParams {
	user: AuthUser;
	attribute: string;
	code: string;
}

export type ConfirmVerifyUserAttribute = (
	params: ConfirmVerifyUserAttributeParams
) => Promise<AuthStateFlow>;
