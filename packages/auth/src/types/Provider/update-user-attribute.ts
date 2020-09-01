import { AuthStateFlow, AuthUser } from './common';

export interface UpdateUserAttributeParams {
	user: AuthUser;
	attributes: Record<string, any>;
}

export type UpdateUserAttribute = (
	params: UpdateUserAttributeParams
) => Promise<AuthStateFlow>;
