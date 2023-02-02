import { StorageHelper, Amplify, UniversalStorage } from '@aws-amplify/core';

export function cacheTokens({
	idToken,
	accessToken,
	refreshToken,
	clockDrift,
	username,
	userPoolClientID,
}) {
	let _storage;
	const amplifyConfig = Amplify.getConfig();
	if (amplifyConfig?.ssr) {
		_storage = new UniversalStorage();
	} else {
		_storage = new StorageHelper().getStorage();
	}

	const keyPrefix = `CognitoIdentityServiceProvider.${userPoolClientID}`;
	const idTokenKey = `${keyPrefix}.${username}.idToken`;
	const accessTokenKey = `${keyPrefix}.${username}.accessToken`;
	const refreshTokenKey = `${keyPrefix}.${username}.refreshToken`;
	const clockDriftKey = `${keyPrefix}.${username}.clockDrift`;
	const lastUserKey = `${keyPrefix}.LastAuthUser`;

	_storage.setItem(idTokenKey, idToken);
	_storage.setItem(accessTokenKey, accessToken);
	_storage.setItem(refreshTokenKey, refreshToken);
	_storage.setItem(clockDriftKey, `${clockDrift}`);
	_storage.setItem(lastUserKey, username);
}

export function readTokens({
	userPoolCliendId,
	req,
}: {
	userPoolCliendId: string;
	req?: any;
}) {
	let _storage;
	const amplifyConfig = Amplify.getConfig();
	if (amplifyConfig?.ssr) {
		_storage = new UniversalStorage({ req });
	} else {
		_storage = new StorageHelper().getStorage();
	}

	const username = 'username';

	const keyPrefix = `CognitoIdentityServiceProvider.${userPoolCliendId}.${username}`;
	const idTokenKey = `${keyPrefix}.idToken`;
	const accessTokenKey = `${keyPrefix}.accessToken`;
	const refreshTokenKey = `${keyPrefix}.refreshToken`;
	const clockDriftKey = `${keyPrefix}.clockDrift`;

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
