import { Hub } from '@aws-amplify/core';
const AMPLIFY_SYMBOL = (
	typeof Symbol !== 'undefined' && typeof Symbol.for === 'function'
		? Symbol.for('amplify_default')
		: '@@amplify_default'
) as Symbol;

export const dispatchAuthEvent = (
	event: string,
	data: any,
	message: string
) => {
	Hub.dispatch('auth', { event, data, message }, 'Auth', AMPLIFY_SYMBOL);
};

export const decodeJWT = (
	token: string
): { [key: string]: string | number | string[] } => {
	try {
		const base64URL = token.split('.')[1];
		const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
		const json = decodeURIComponent(
			atob(base64)
				.split('')
				.map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(json);
	} catch (err) {
		return {};
	}
};

const hasExpiration = (decodedToken: {
	[key: string]: string | number | string[];
}): decodedToken is typeof decodedToken & { exp: number } => {
	return (
		decodedToken && typeof (decodedToken as { exp: number }).exp !== 'undefined'
	);
};

export const getExpirationTimeFromJWT = (token: string): number => {
	const decodedToken = decodeJWT(token);
	if (!hasExpiration(decodedToken)) {
		throw new Error('No expiration time on JWT');
	}
	return decodedToken.exp;
};
