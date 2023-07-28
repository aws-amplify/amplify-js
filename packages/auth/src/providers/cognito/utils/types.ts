import {
	AuthConfig,
	UserPoolConfig,
	IdentityPoolConfig,
} from '@aws-amplify/core';

export function isTypeUserPoolConfig(
	authConfig?: AuthConfig
): authConfig is UserPoolConfig {
	if (authConfig && authConfig.userPoolId && authConfig.userPoolWebClientId) {
		return true;
	}

	return false;
}

export function isTypeIdentityPoolConfig(
	authConfig?: AuthConfig
): authConfig is IdentityPoolConfig {
	if (authConfig && authConfig.identityPoolId) {
		return true;
	}
	return false;
}
