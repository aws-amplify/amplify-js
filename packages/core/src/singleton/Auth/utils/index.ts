import { Buffer } from 'buffer';
import { asserts } from '../../../Util/errors/AssertError';
import {
	AuthConfig,
	IdentityPoolConfig,
	JWT,
	UserPoolConfig,
	UserPoolConfigAndIdentityPoolConfig,
} from '../types';

export function assertTokenProviderConfig(
	authConfig?: AuthConfig
): asserts authConfig is UserPoolConfig {
	const validConfig =
		!!authConfig?.userPoolId && !!authConfig?.userPoolWebClientId;
	return asserts(validConfig, {
		name: 'AuthTokenConfigException',
		message: 'Auth Token Provider not configured',
		recoverySuggestion: 'Make sure to call Amplify.configure in your app',
	});
}

export function assertIdentityPooIdConfig(
	authConfig: AuthConfig
): asserts authConfig is IdentityPoolConfig {
	const validConfig = !!authConfig?.identityPoolId;
	return asserts(validConfig, {
		name: 'AuthIdentityPoolIdException',
		message: 'Auth IdentityPoolId not configured',
		recoverySuggestion:
			'Make sure to call Amplify.configure in your app with a valid IdentityPoolId',
	});
}

export function assertUserPoolAndIdentityPooConfig(
	authConfig: AuthConfig
): asserts authConfig is UserPoolConfigAndIdentityPoolConfig {
	const validConfig = !!authConfig?.identityPoolId && !!authConfig?.userPoolId;
	return asserts(validConfig, {
		name: 'AuthUserPoolAndIdentityPoolException',
		message: 'Auth UserPool and IdentityPool not configured',
		recoverySuggestion:
			'Make sure to call Amplify.configure in your app with UserPoolId and IdentityPoolId',
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
