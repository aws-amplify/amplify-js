// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	KeyValueStorageInterface,
	decodeJWT,
	defaultStorage,
} from '@aws-amplify/core';

import { DefaultTokenStore } from '../../../src/providers/cognito/tokenProvider';

jest.mock('../../../src/providers/cognito/utils/oauth/oAuthStore');
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	decodeJWT: jest.fn().mockImplementation(() => {
		return {
			payload: {
				exp: Math.floor(Date.now() / 1000) + 3600,
				iss: 'https://authprovider.region.amazonaws.com/',
				sub: 'tester0523',
				iat: Math.floor(Date.now() / 1000),
			},
			toString: decodeJWT.toString,
		};
	}),
}));

const mockAccessToken = {
	payload: {
		exp: Math.floor(Date.now() / 1000) + 3600,
		iss: 'https://authprovider.region.amazonaws.com/',
		sub: 'tester0523',
		iat: Math.floor(Date.now() / 1000),
	},
	toString: () => `${authIDP}.${userPoolClientId}.${userSub}.accessToken`,
};

const mockIdToken = {
	payload: {
		exp: Math.floor(Date.now() / 1000) + 3600,
		iss: 'https://authprovider.region.amazonaws.com/',
		sub: 'tester0523',
		iat: Math.floor(Date.now() / 1000),
	},
	toString: () => `${authIDP}.${userPoolClientId}.${userSub}.idToken`,
};

const mockAuthToken = {
	idToken: mockIdToken,
	accessToken: mockAccessToken,
	refreshToken: 'testRefreshToken',
	clockDrift: 1000,
	username: 'tester0523',
};

const userPoolId = 'us-west-1:0000523';
const userPoolClientId = 'mockCognitoUserPoolsId';
const userSub = 'tester0523';
const authIDP = 'CognitoIdentityServiceProvider';

describe('TokenStore', () => {
	let tokenStore = new DefaultTokenStore();
	let keyValStorage: KeyValueStorageInterface;

	beforeEach(() => {
		tokenStore = new DefaultTokenStore();
		tokenStore.setKeyValueStorage(defaultStorage);
		tokenStore.setAuthConfig({
			Cognito: {
				userPoolId,
				userPoolClientId,
			},
		});
		keyValStorage = tokenStore.getKeyValueStorage();
	});
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getLastAuthUser', () => {
		it('should return the last authenticated user', async () => {
			const mockUser = 'mockUser';
			jest.spyOn(keyValStorage, 'getItem').mockResolvedValueOnce(mockUser);

			const result = await tokenStore.getLastAuthUser();
			expect(result).toBe(mockUser);
		});

		it('should return string username when no last auth user exists', async () => {
			jest.spyOn(keyValStorage, 'getItem').mockResolvedValueOnce(null);

			const result = await tokenStore.getLastAuthUser();
			expect(result).toBe('username');
		});
	});

	describe('loadTokens', () => {
		it('should load and return stored tokens', async () => {
			await tokenStore.storeTokens(mockAuthToken);

			jest.spyOn(keyValStorage, 'getItem').mockImplementation(key => {
				switch (key) {
					case `${authIDP}.${userPoolClientId}.${userSub}.accessToken`:
						return Promise.resolve(mockAuthToken.accessToken.toString());
					case `${authIDP}.${userPoolClientId}.${userSub}.idToken`:
						return Promise.resolve(mockAuthToken.idToken.toString());
					case `${authIDP}.${userPoolClientId}.${userSub}.refreshToken`:
						return Promise.resolve(mockAuthToken.refreshToken);
					case `${authIDP}.${userPoolClientId}.${userSub}.clockDrift`:
						return Promise.resolve(mockAuthToken.clockDrift.toString());
					case `${authIDP}.${userPoolClientId}.LastAuthUser`:
						return Promise.resolve(mockAuthToken.username);
					default:
						return Promise.resolve(null);
				}
			});
			const result = await tokenStore.loadTokens();

			expect(result).toEqual({
				accessToken: expect.objectContaining({
					payload: {
						exp: expect.any(Number),
						iat: expect.any(Number),
						iss: 'https://authprovider.region.amazonaws.com/',
						sub: 'tester0523',
					},
				}),
				idToken: expect.objectContaining({
					payload: {
						exp: expect.any(Number),
						iat: expect.any(Number),
						iss: 'https://authprovider.region.amazonaws.com/',
						sub: 'tester0523',
					},
				}),
				refreshToken: mockAuthToken.refreshToken,
				deviceMetadata: undefined,
				clockDrift: mockAuthToken.clockDrift,
				username: mockAuthToken.username,
			});
		});
	});

	describe('storeTokens', () => {
		it('should store tokens successfully', async () => {
			const setItemSpy = jest
				.spyOn(keyValStorage, 'setItem')
				.mockResolvedValue(undefined);

			await tokenStore.storeTokens(mockAuthToken);

			expect(setItemSpy).toHaveBeenCalledTimes(5);
			expect(setItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.accessToken`,
				mockAuthToken.accessToken.toString(),
			);
			expect(setItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.idToken`,
				mockAuthToken.idToken.toString(),
			);
			expect(setItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.refreshToken`,
				mockAuthToken.refreshToken,
			);
			expect(setItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.clockDrift`,
				mockAuthToken.clockDrift.toString(),
			);
			expect(setItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.LastAuthUser`,
				mockAuthToken.username,
			);
		});
	});

	describe('clearTokens', () => {
		it('should clear all stored tokens', async () => {
			const removeItemSpy = jest
				.spyOn(keyValStorage, 'removeItem')
				.mockResolvedValue(undefined);

			await tokenStore.clearTokens();

			expect(removeItemSpy).toHaveBeenCalledTimes(7);
			expect(removeItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.accessToken`,
			);
			expect(removeItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.idToken`,
			);
			expect(removeItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.refreshToken`,
			);
			expect(removeItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.clockDrift`,
			);
			expect(removeItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.LastAuthUser`,
			);
		});
	});

	describe('getDeviceMetadata', () => {
		it('should return device metadata for a user', async () => {
			const mockMetadata = {
				deviceKey: 'mockDeviceKey',
				deviceGroupKey: 'mockDeviceGroupKey',
				randomPassword: 'mockRandomPasswordKey',
			};

			const mockAuthMetadataWithDeviceMetadata = {
				...mockAuthToken,
				deviceMetadata: mockMetadata,
			};
			const getItemSpy = jest.spyOn(keyValStorage, 'getItem');
			await tokenStore.storeTokens(mockAuthMetadataWithDeviceMetadata);
			await tokenStore.getDeviceMetadata(userSub);
			expect(getItemSpy).toHaveBeenCalledTimes(4);
			expect(getItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.deviceKey`,
			);
			expect(getItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.deviceGroupKey`,
			);
			expect(getItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.randomPasswordKey`,
			);
		});

		it('should return null when any of randomPassword, deviceGroupKey, deviceKey does not present in KVStorage', async () => {
			jest.spyOn(keyValStorage, 'getItem');

			const result = await tokenStore.getDeviceMetadata('testUser');
			expect(result).toBeNull();
		});
	});

	describe('setOAuthMetadata', () => {
		it('should store OAuth metadata', async () => {
			const setItemSpy = jest
				.spyOn(keyValStorage, 'setItem')
				.mockResolvedValue(undefined);

			const mockMetadata = {
				state: 'mockState',
				pkce: 'mockProofKey',
				oauthSignIn: true,
			};

			await tokenStore.setOAuthMetadata(mockMetadata);

			expect(setItemSpy).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.oauthMetadata`,
				JSON.stringify(mockMetadata),
			);
		});
	});

	describe('getOAuthMetadata', () => {
		it('should retrieve OAuth metadata', async () => {
			const mockMetadata = {
				state: 'mockState',
				pkce: 'mockProofKey',
			};

			jest
				.spyOn(keyValStorage, 'getItem')
				.mockResolvedValue(JSON.stringify(mockMetadata));

			const result = await tokenStore.getOAuthMetadata();
			expect(result).toEqual(mockMetadata);
		});

		it('should return null when no OAuth metadata exists', async () => {
			jest.spyOn(keyValStorage, 'getItem').mockResolvedValue(null);

			const result = await tokenStore.getOAuthMetadata();
			expect(result).toBeNull();
		});
	});

	describe('concurrent operations', () => {
		it('should handle concurrent storeTokens and loadTokens operations safely', async () => {
			const newMockAuthToken = {
				...mockAuthToken,
				refreshToken: 'newTestRefreshToken',
				clockDrift: 523,
			};

			const operations: string[] = [];
			jest
				.spyOn(keyValStorage, 'setItem')
				.mockImplementation(async (key, _) => {
					operations.push(`setItem:${key}`);
					await new Promise(resolve => setTimeout(resolve, 10));

					return Promise.resolve();
				});

			jest.spyOn(keyValStorage, 'getItem').mockImplementation(async key => {
				operations.push(`getItem:${key}`);
				await new Promise(resolve => setTimeout(resolve, 5));
				switch (key) {
					case `${authIDP}.${userPoolClientId}.${userSub}.accessToken`:
						return Promise.resolve(mockAuthToken.accessToken.toString());
					case `${authIDP}.${userPoolClientId}.${userSub}.idToken`:
						return Promise.resolve(newMockAuthToken.idToken.toString());
					case `${authIDP}.${userPoolClientId}.${userSub}.refreshToken`:
						return Promise.resolve(newMockAuthToken.refreshToken);
					case `${authIDP}.${userPoolClientId}.${userSub}.clockDrift`:
						return Promise.resolve(newMockAuthToken.clockDrift.toString());
					case `${authIDP}.${userPoolClientId}.LastAuthUser`:
						return Promise.resolve(newMockAuthToken.username);
					default:
						return Promise.resolve(null);
				}
			});

			const storePromise = tokenStore.storeTokens(newMockAuthToken);
			const loadPromise = tokenStore.loadTokens();

			const [storeResult, loadResult] = await Promise.allSettled([
				storePromise,
				loadPromise,
			]);

			expect(storeResult.status).toBe('fulfilled');
			expect(loadResult.status).toBe('fulfilled');

			if (loadResult.status === 'fulfilled') {
				const loadedTokens = loadResult.value;
				expect(loadedTokens).toBeTruthy();
				expect(loadedTokens?.refreshToken).toBe(newMockAuthToken.refreshToken);
			}

			console.debug(operations);
			const setOps = operations.filter(op => op.startsWith(`setItem:`)).length;
			const getOps = operations.filter(op => op.startsWith(`getItem:`)).length;
			expect(setOps).toBeGreaterThan(0);
			expect(getOps).toBeGreaterThan(0);

			const finalTokens = await tokenStore.loadTokens();
			expect(finalTokens?.refreshToken).toBe(newMockAuthToken.refreshToken);
		});
	});
});
