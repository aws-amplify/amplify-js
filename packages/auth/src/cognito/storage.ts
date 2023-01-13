import { StorageHelper } from '@aws-amplify/core';

export function cacheTokens({
	idToken,
	accessToken,
	refreshToken,
	clockDrift,
	username,
	userPoolClientID,
}) {
	const keyPrefix = `CognitoIdentityServiceProvider.${userPoolClientID}`;
	const idTokenKey = `${keyPrefix}.${username}.idToken`;
	const accessTokenKey = `${keyPrefix}.${username}.accessToken`;
	const refreshTokenKey = `${keyPrefix}.${username}.refreshToken`;
	const clockDriftKey = `${keyPrefix}.${username}.clockDrift`;
	const lastUserKey = `${keyPrefix}.LastAuthUser`;
	const _storage = new StorageHelper().getStorage();

	_storage.setItem(idTokenKey, idToken);
	_storage.setItem(accessTokenKey, accessToken);
	_storage.setItem(refreshTokenKey, refreshToken);
	_storage.setItem(clockDriftKey, `${clockDrift}`);
	_storage.setItem(lastUserKey, username);
}

export function readTokens({ userPoolCliendId }) {
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
