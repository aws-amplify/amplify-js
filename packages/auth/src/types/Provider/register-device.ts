import { AuthUser, AuthStateFlow } from './common';

export interface RegisterDeviceParams {
	user: AuthUser;
	providerOptions: Record<string, any>;
}

export type RegisterDevice = (
	params: RegisterDeviceParams
) => Promise<AuthStateFlow>;
