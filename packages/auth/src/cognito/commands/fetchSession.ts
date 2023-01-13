import { StorageHelper, Amplify, parseAWSExports } from '@aws-amplify/core';

export async function fetchSession() {
	const amplifyConfig = parseAWSExports(Amplify.getConfig()) as any;
	if (amplifyConfig && amplifyConfig.Auth) {
		// load credentials from storage
		const tokens = readTokens({
			userPoolCliendId: amplifyConfig.Auth.userPoolWebClientId,
		});

		if (tokens) {
			const { accessToken, idToken, refreshToken } = tokens;
			if (!isTokenValid(accessToken) || !isTokenValid(idToken)) {
			}
			Amplify.setUser({
				accessToken,
				idToken,
				refreshToken,
			});
		}
		// update Amplify user object
		return tokens;
	}
}

function readTokens({ userPoolCliendId }) {
	const username = 'username';

	const keyPrefix = `CognitoIdentityServiceProvider.${userPoolCliendId}.${username}`;
	const idTokenKey = `${keyPrefix}.idToken`;
	const accessTokenKey = `${keyPrefix}.accessToken`;
	const refreshTokenKey = `${keyPrefix}.refreshToken`;
	const clockDriftKey = `${keyPrefix}.clockDrift`;

	const _storage = new StorageHelper().getStorage();

	if (_storage.getItem(idTokenKey)) {
		const idToken = _storage.getItem(idTokenKey);
		const accessToken = _storage.getItem(accessTokenKey);
		const refreshToken = _storage.getItem(refreshTokenKey);
		const clockDrift = Number.parseInt(_storage.getItem(clockDriftKey), 0);

		return {
			accessToken,
			idToken,
			refreshToken,
			clockDrift,
		};
	}

	return undefined;
}

function getTokenClaim({ token, claim }) {
	const payload = token.split('.')[1];
	if (!payload) return null;
	try {
		const payloadObj = JSON.parse(
			Buffer.from(payload, 'base64').toString('utf8')
		);
		if (payloadObj && payloadObj[claim]) {
			return payloadObj[claim];
		}
	} catch (err) {
		return null;
	}
}

const EXPIRATION_CLAIM = 'exp';

function isTokenValid({ token }) {
	const now = Math.floor(new Date().getTime() / 1000);
	const expiration = getTokenClaim({ token, claim: EXPIRATION_CLAIM });

	return Number.isInteger(expiration) && expiration > now;
}
