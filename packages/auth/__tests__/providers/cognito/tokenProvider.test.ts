import { KeyValueStorageInterface } from '@aws-amplify/core';
import { DefaultTokenStore } from '../../../src/providers/cognito';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

class MemoryStorage implements KeyValueStorageInterface {
	store: Record<string, string> = {};
	async setItem(key: string, value: string): Promise<void> {
		this.store[key] = value;
	}
	async getItem(key: string): Promise<string | null> {
		return this.store[key];
	}
	async removeItem(key: string): Promise<void> {
		delete this.store[key];
	}
	async clear(): Promise<void> {
		this.store = {};
	}
}

describe('Loading tokens', () => {
	it('should load tokens from store', async () => {
		const tokenStore = new DefaultTokenStore();
		const memoryStorage = new MemoryStorage();
		const userPoolClientId = 'abcdefgh';
		const userSub = 'user123';
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser`,
			userSub,
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.accessToken`,
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.idToken`,
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.refreshToken`,
			'dsasdasdasdasdasdasdasd',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.clockDrift`,
			'10',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.deviceKey`,
			'device-key',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.deviceGroupKey`,
			'device-group-key',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.randomPasswordKey`,
			'random-password',
		);

		tokenStore.setKeyValueStorage(memoryStorage);
		tokenStore.setAuthConfig({
			Cognito: {
				userPoolId: 'us-east-1:1111111',
				userPoolClientId,
			},
		});
		const result = await tokenStore.loadTokens();

		expect(result?.accessToken.toString()).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y',
		);
		expect(result?.idToken?.toString()).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y',
		);
		expect(result?.clockDrift).toBe(10);
		expect(result?.refreshToken).toBe('dsasdasdasdasdasdasdasd');
		expect(result?.deviceMetadata?.deviceGroupKey).toBe('device-group-key');
		expect(result?.deviceMetadata?.randomPassword).toBe('random-password');
		expect(result?.deviceMetadata?.deviceKey).toBe('device-key');
	});
});

describe('saving tokens', () => {
	it('should save tokens from store first time', async () => {
		const tokenStore = new DefaultTokenStore();
		const memoryStorage = new MemoryStorage();
		const userPoolClientId = 'abcdefgh';

		tokenStore.setKeyValueStorage(memoryStorage);
		tokenStore.setAuthConfig({
			Cognito: {
				userPoolId: 'us-east-1:1111111',
				userPoolClientId,
			},
		});
		const lastAuthUser = 'amplify@user';
		await tokenStore.storeTokens({
			accessToken: decodeJWT(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.AAA',
			),
			idToken: decodeJWT(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.III',
			),
			clockDrift: 150,
			refreshToken: 'refresh-token',
			deviceMetadata: {
				deviceKey: 'device-key2',
				deviceGroupKey: 'device-group-key2',
				randomPassword: 'random-password2',
			},
			username: lastAuthUser,
		});

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser`,
			),
		).toBe(lastAuthUser);

		// Refreshed tokens

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${lastAuthUser}.accessToken`,
			),
		).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.AAA',
		);

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${lastAuthUser}.idToken`,
			),
		).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.III',
		);

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${lastAuthUser}.refreshToken`,
			),
		).toBe('refresh-token');

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${lastAuthUser}.clockDrift`,
			),
		).toBe('150');
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${lastAuthUser}.deviceKey`,
			),
		).toBe('device-key2');
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${lastAuthUser}.deviceGroupKey`,
			),
		).toBe('device-group-key2');
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${lastAuthUser}.randomPasswordKey`,
			),
		).toBe('random-password2');
	});
	it('should save tokens from store clear old tokens', async () => {
		const tokenStore = new DefaultTokenStore();
		const memoryStorage = new MemoryStorage();
		const userPoolClientId = 'abcdefgh';
		const oldUserName = 'amplify@user';

		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser`,
			oldUserName,
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.accessToken`,
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.idToken`,
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.refreshToken`,
			'dsasdasdasdasdasdasdasd',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.clockDrift`,
			'10',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.deviceKey`,
			'device-key',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.deviceGroupKey`,
			'device-group-key',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.randomPasswordKey`,
			'random-password',
		);

		tokenStore.setKeyValueStorage(memoryStorage);
		tokenStore.setAuthConfig({
			Cognito: {
				userPoolId: 'us-east-1:1111111',
				userPoolClientId,
			},
		});

		await tokenStore.storeTokens({
			accessToken: decodeJWT(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.AAA',
			),
			idToken: decodeJWT(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.III',
			),
			clockDrift: 150,
			refreshToken: 'refresh-token',
			deviceMetadata: {
				deviceKey: 'device-key2',
				deviceGroupKey: 'device-group-key2',
				randomPassword: 'random-password2',
			},
			username: oldUserName,
		});

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser`,
			),
		).toBe(oldUserName);

		// Refreshed tokens

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.accessToken`,
			),
		).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.AAA',
		);

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.idToken`,
			),
		).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.III',
		);

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.refreshToken`,
			),
		).toBe('refresh-token');

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.clockDrift`,
			),
		).toBe('150');

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.deviceKey`,
			),
		).toBe('device-key2');
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.deviceGroupKey`,
			),
		).toBe('device-group-key2');
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.randomPasswordKey`,
			),
		).toBe('random-password2');
	});
});

describe('device tokens', () => {
	let tokenStore;
	let memoryStorage;
	let userPoolClientId;
	let userSub1;
	let userSub2;
	beforeEach(() => {
		tokenStore = new DefaultTokenStore();
		memoryStorage = new MemoryStorage();
		userPoolClientId = 'userPoolClientId';
		userSub1 = 'user1@email.com';
		userSub2 = 'user2@email.com';

		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub1}.deviceKey`,
			'user1-device-key',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub1}.deviceGroupKey`,
			'user1-device-group-key',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub1}.randomPasswordKey`,
			'user1-random-password',
		);

		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub2}.deviceKey`,
			'user2-device-key',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub2}.deviceGroupKey`,
			'user2-device-group-key',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub2}.randomPasswordKey`,
			'user2-random-password',
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser`,
			userSub2,
		);

		tokenStore.setKeyValueStorage(memoryStorage);
		tokenStore.setAuthConfig({
			Cognito: {
				userPoolId: 'us-east-1:1111111',
				userPoolClientId,
			},
		});
	});

	it('should get device metadata tokens from store', async () => {
		const user2DeviceMetadata = await tokenStore.getDeviceMetadata(userSub1);
		expect(user2DeviceMetadata?.randomPassword).toBe('user1-random-password');
		expect(user2DeviceMetadata?.deviceGroupKey).toBe('user1-device-group-key');
		expect(user2DeviceMetadata?.deviceKey).toBe('user1-device-key');

		const user3DeviceMetadata = await tokenStore.getDeviceMetadata();
		expect(user3DeviceMetadata?.randomPassword).toBe('user2-random-password');
		expect(user3DeviceMetadata?.deviceGroupKey).toBe('user2-device-group-key');
		expect(user3DeviceMetadata?.deviceKey).toBe('user2-device-key');
	});

	it('should clear device metadata tokens from store', async () => {
		await tokenStore.clearDeviceMetadata(userSub1);
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub1}.deviceKey`,
			),
		).toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub1}.deviceGroupKey`,
			),
		).toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub1}.randomPasswordKey`,
			),
		).toBeUndefined();
		expect(
			// userSub1 cleared, userSub2 not cleared
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub2}.randomPasswordKey`,
			),
		).not.toBeUndefined();

		await tokenStore.clearDeviceMetadata();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub2}.deviceKey`,
			),
		).toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub2}.deviceGroupKey`,
			),
		).toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub2}.randomPasswordKey`,
			),
		).toBeUndefined();
	});
});
