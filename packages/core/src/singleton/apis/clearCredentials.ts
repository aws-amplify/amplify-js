import { Amplify } from '../Amplify';

export function clearCredentials(): Promise<void> {
	return Amplify.Auth.clearCredentials();
}
