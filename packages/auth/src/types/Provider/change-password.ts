import { AuthStateFlow, AuthUser } from './common';

export interface ChangePasswordParams {
	user: AuthUser;
	oldPassword: string;
	newPassword: string;
}

export type ChangePassword = (
	params: ChangePasswordParams
) => Promise<AuthStateFlow>;
