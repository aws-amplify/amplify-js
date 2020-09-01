import { AuthStateFlow, AuthUser } from './common';

export interface UnregisterDeviceParams {
	user: AuthUser;
	providerOptions: Record<string, any>;
}

export type UnregisterDevice = (
	params: UnregisterDeviceParams
) => Promise<AuthStateFlow>;
