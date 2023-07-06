import { UserPoolTokenManager } from '../src/storage/UserPoolTokenManager';
import { LocalStorage } from '@aws-amplify/core';
import { CognitoUserPoolTokens } from '../src/storage/types';
import { LegacyUserPoolTokenManager } from '../src/storage/LegacyUserPoolManager';
import { AuthError } from '../src/errors/AuthError';
import { AuthErrorCodes } from '../src/common/AuthErrorStrings';
import { getCognitoKeys } from '../src/storage/helpers';
import { LegacyCognitoUserPoolKeys } from '../src/storage/keys';

const clientId = '12343-abcd-AZWB';

const config = {
	clientId,
};
const accessToken = '12easdfasdxbxcqaxsd';
const idToken = '1234sfasdfsfjdxcxq';
const refreshToken = 'asdfzxcvqrez8zdcdzddsaz';
const cognitoUserPoolTokens: CognitoUserPoolTokens = {
	accessToken,
	idToken,
	refreshToken,
};

describe('test userpool token manager', () => {
	const userPoolManager = new UserPoolTokenManager(config, LocalStorage);

	beforeEach(async () => {
		await userPoolManager.storeTokens(cognitoUserPoolTokens);
	});
	afterEach(async () => {
		await userPoolManager.clearTokens();
	});

	test('user pool manager should load tokens ', async () => {
		expect(await userPoolManager.loadTokens()).toEqual(cognitoUserPoolTokens);
	});

	test('user pool manager should return null if there are no tokens in storage ', async () => {
		await userPoolManager.clearTokens();

		expect(await userPoolManager.loadTokens()).toEqual(null);
	});

	test('user pool token manager should store tokens with a scoped key', async () => {
		const key = `com.amplify.cognito.auth.${clientId}.idToken`;

		expect(await LocalStorage.getItem(key)).toEqual(idToken);
	});
});

describe('test legacy userpool token manager', () => {
	const username = 'username';
	const legacyPrefix = 'CognitoIdentityServiceProvider';
	const userData = 'userData';
	const clockDrift = '0';
	const keys = getCognitoKeys(LegacyCognitoUserPoolKeys)(
		legacyPrefix,
		`${clientId}.${username}`
	);

	// set legacy tokens first
	beforeEach(async () => {
		await LocalStorage.setItem(keys.idToken, idToken);
		await LocalStorage.setItem(keys.refreshToken, refreshToken);
		await LocalStorage.setItem(keys.accessToken, accessToken);
		await LocalStorage.setItem(`${legacyPrefix}.${clientId}.LastAuthUser`, username);
		await LocalStorage.setItem(keys.clockDrift, clockDrift);
		await LocalStorage.setItem(keys.userData, userData);
	});

	afterEach(async () => {
		await LocalStorage.clear();
	});

	const legacyUserPoolManager = new LegacyUserPoolTokenManager(
		config,
		username,
		LocalStorage
	);
	test('legacy userpool manager should not allow to set tokens', async () => {
		try {
			await legacyUserPoolManager.storeTokens(cognitoUserPoolTokens);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthErrorCodes.LegacyUserPoolManagerException);
		}
	});

	test('legacy user pool manager should load tokens ', async () => {
		console.log(await legacyUserPoolManager.loadTokens());
		expect(await legacyUserPoolManager.loadTokens()).toEqual({
			...cognitoUserPoolTokens,
			clockDrift,
			userData,
			lastAuthUser: username,
		});
	});

	test('legacyuser pool manager should return null if there are no tokens in storage ', async () => {
		await legacyUserPoolManager.clearTokens();

		expect(await legacyUserPoolManager.loadTokens()).toEqual(null);
	});
});
