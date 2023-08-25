import { AmplifyV6 } from '../Amplify';

export function clearCredentials(): Promise<void> {
	return AmplifyV6.Auth.clearCredentials();
}
