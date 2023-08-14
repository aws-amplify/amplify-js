import { AuthConfig, AuthTokens, UserPoolConfig } from '@aws-amplify/core';
import { AuthError } from '../../../errors/AuthError';

export function isTypeUserPoolConfig(
	authConfig?: AuthConfig
): authConfig is UserPoolConfig {
	if (authConfig && authConfig.userPoolId && authConfig.userPoolWebClientId) {
		return true;
	}

	return false;
}

export function assertAuthTokens(
	tokens?: AuthTokens
): asserts tokens is AuthTokens {
	if (!tokens || !tokens.accessToken) {
		throw new AuthError({
			name: 'Invalid Auth Tokens',
			message: 'No Auth Tokens were found',
		});
	}
}
