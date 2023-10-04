import { KeyValueStorageInterface } from '@aws-amplify/core';
import { DefaultTokenStore } from '../../../src/providers/cognito';

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
	});
});
