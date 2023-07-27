import { Buffer } from 'buffer';
import { asserts } from '../../../Util/errors/AssertError';
import { AuthConfig, AuthKeys, JWT } from '../types';
import { KeyValueStorageInterface } from '../../../types';

export function assertTokenProviderConfig(authConfig?: AuthConfig) {
	const validConfig =
		!!authConfig?.userPoolId && !!authConfig?.userPoolWebClientId;
	return asserts(validConfig, {
		name: 'AuthTokenConfigException',
		message: 'Auth Token Provider not configured',
		recoverySuggestion: 'Make sure to call Amplify.configure in your app',
	});
}

export function assertCredentialsProviderConfig(authConfig: AuthConfig) {
	const validConfig = !!authConfig?.identityPoolId;
	return asserts(validConfig, {
		name: 'AuthCredentialConfigException',
		message: 'Auth Credentials provider not configured',
		recoverySuggestion: 'Make sure to call Amplify.configure in your app',
	});
}

export function decodeJWT(token: string): JWT {
	const tokenSplitted = token.split('.');
	if (tokenSplitted.length !== 3) {
		throw new Error('Invalid token');
	}

	const payloadString = tokenSplitted[1];
	const payload = JSON.parse(
		Buffer.from(payloadString, 'base64').toString('utf8')
	);

	try {
		return {
			toString: () => token,
			payload,
		};
	} catch (err) {
		throw new Error('Invalid token payload');
	}
}

export function getAuthStorageKeys<T extends Record<string, string>>(
	authKeys: T
) {
	const keys = Object.values({ ...authKeys });
	return (prefix: string, identifier: string) =>
		keys.reduce(
			(acc, authKey) => ({
				...acc,
				[authKey]: `${prefix}.${identifier}.${authKey}`,
			}),
			{} as AuthKeys<keyof T & string>
		);
}

export const LEGACY_KEY_PREFIX = 'CognitoIdentityServiceProvider';

export async function getUsernameFromStorage(
	storage: KeyValueStorageInterface,
	legacyKey: string
): Promise<string | null> {
	return storage.getItem(legacyKey);
}
