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
	test('load tokens from store', async () => {
		const tokenStore = new DefaultTokenStore();
		const memoryStorage = new MemoryStorage();
		const userPoolClientId = 'abcdefgh';
		const userSub = 'user123';
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser`,
			userSub
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.accessToken`,
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.idToken`,
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.refreshToken`,
			'dsasdasdasdasdasdasdasd'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.clockDrift`,
			'10'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.deviceKey`,
			'device-key'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.deviceGroupKey`,
			'device-group-key'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub}.randomPasswordKey`,
			'random-password'
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
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y'
		);
		expect(result?.idToken?.toString()).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y'
		);
		expect(result?.clockDrift).toBe(10);
		expect(result?.refreshToken).toBe('dsasdasdasdasdasdasdasd');
		expect(result?.deviceMetadata?.deviceGroupKey).toBe('device-group-key');
		expect(result?.deviceMetadata?.randomPassword).toBe('random-password');
		expect(result?.deviceMetadata?.deviceKey).toBe('device-key');
	});

	test('load device tokens from store', async () => {
		const tokenStore = new DefaultTokenStore();
		const memoryStorage = new MemoryStorage();
		const userPoolClientId = 'userPoolClientId';
		const userSub1 = 'user1@email.com';
		const userSub1Encoded = 'user1%40email.com';
		const userSub2 = 'user2@email.com';

		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub1Encoded}.deviceKey`,
			'device-key'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub1Encoded}.deviceGroupKey`,
			'device-group-key'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub1Encoded}.randomPasswordKey`,
			'random-password'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub2}.deviceKey`,
			'device-key'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub2}.deviceGroupKey`,
			'device-group-key'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${userSub2}.randomPasswordKey`,
			'random-password'
		);

		tokenStore.setKeyValueStorage(memoryStorage);
		tokenStore.setAuthConfig({
			Cognito: {
				userPoolId: 'us-east-1:1111111',
				userPoolClientId,
			},
		});
		const user1DeviceMetadata = await tokenStore.getDeviceMetadata(userSub1);
		expect(user1DeviceMetadata?.randomPassword).toBe('random-password');
		expect(user1DeviceMetadata?.deviceGroupKey).toBe('device-group-key');
		expect(user1DeviceMetadata?.deviceKey).toBe('device-key');

		const user2DeviceMetadata = await tokenStore.getDeviceMetadata(userSub2);
		expect(user2DeviceMetadata?.randomPassword).toBe('random-password');
		expect(user2DeviceMetadata?.deviceGroupKey).toBe('device-group-key');
		expect(user2DeviceMetadata?.deviceKey).toBe('device-key');
	});
});

describe('saving tokens', () => {
	test('save tokens from store first time', async () => {
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

		await tokenStore.storeTokens({
			accessToken: decodeJWT(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.AAA'
			),
			idToken: decodeJWT(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.III'
			),
			clockDrift: 150,
			refreshToken: 'refresh-token',
			deviceMetadata: {
				deviceKey: 'device-key2',
				deviceGroupKey: 'device-group-key2',
				randomPassword: 'random-password2',
			},
			username: 'amplify@user',
		});

		const usernameDecoded = 'amplify%40user';

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser`
			)
		).toBe(usernameDecoded); // from decoded JWT

		// Refreshed tokens

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameDecoded}.accessToken`
			)
		).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.AAA'
		);

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameDecoded}.idToken`
			)
		).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.III'
		);

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameDecoded}.refreshToken`
			)
		).toBe('refresh-token');

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameDecoded}.clockDrift`
			)
		).toBe('150');
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameDecoded}.deviceKey`
			)
		).toBe('device-key2');
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameDecoded}.deviceGroupKey`
			)
		).toBe('device-group-key2');
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameDecoded}.randomPasswordKey`
			)
		).toBe('random-password2');
	});
	test('save tokens from store clear old tokens', async () => {
		const tokenStore = new DefaultTokenStore();
		const memoryStorage = new MemoryStorage();
		const userPoolClientId = 'abcdefgh';
		const oldUserName = 'amplify@user';

		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser`,
			oldUserName
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.accessToken`,
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.idToken`,
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.Y'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.refreshToken`,
			'dsasdasdasdasdasdasdasd'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.clockDrift`,
			'10'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.deviceKey`,
			'device-key'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.deviceGroupKey`,
			'device-group-key'
		);
		memoryStorage.setItem(
			`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.randomPasswordKey`,
			'random-password'
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
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.AAA'
			),
			idToken: decodeJWT(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.III'
			),
			clockDrift: 150,
			refreshToken: 'refresh-token',
			deviceMetadata: {
				deviceKey: 'device-key2',
				deviceGroupKey: 'device-group-key2',
				randomPassword: 'random-password2',
			},
			username: 'amplify@user',
		});

		const usernameEncoded = 'amplify%40user';

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.LastAuthUser`
			)
		).toBe(usernameEncoded); // from decoded JWT

		// Refreshed tokens

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameEncoded}.accessToken`
			)
		).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.AAA'
		);

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameEncoded}.idToken`
			)
		).toBe(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzAsInVzZXJuYW1lIjoiYW1wbGlmeUB1c2VyIn0.III'
		);

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameEncoded}.refreshToken`
			)
		).toBe('refresh-token');

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameEncoded}.clockDrift`
			)
		).toBe('150');

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameEncoded}.deviceKey`
			)
		).toBe('device-key2');
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameEncoded}.deviceGroupKey`
			)
		).toBe('device-group-key2');
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${usernameEncoded}.randomPasswordKey`
			)
		).toBe('random-password2');

		// old tokens cleared
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.accessToken`
			)
		).toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.idToken`
			)
		).toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.refreshToken`
			)
		).toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.clockDrift`
			)
		).toBeUndefined();

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.idToken`
			)
		).toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.refreshToken`
			)
		).toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.clockDrift`
			)
		).toBeUndefined();

		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.deviceKey`
			)
		).not.toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.deviceGroupKey`
			)
		).not.toBeUndefined();
		expect(
			await memoryStorage.getItem(
				`CognitoIdentityServiceProvider.${userPoolClientId}.${oldUserName}.randomPasswordKey`
			)
		).not.toBeUndefined();
	});
});
