// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, KeyValueStorageInterface } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL, decodeJWT } from '@aws-amplify/core/internals/utils';

import {
	AUTH_KEY_PREFIX,
	DefaultTokenStore,
} from '../../../../src/providers/cognito/tokenProvider';

const userPoolId = 'us-west-1:0000523';
const userPoolClientId = 'mockCognitoUserPoolsId';
const userSub = 'tester0523';
const userSub2 = 'tester1123';
const authIDP = 'CognitoIdentityServiceProvider';
const authProviderISS = 'https://authprovider.region.amazonaws.com/';

jest.mock('@aws-amplify/core/internals/utils');
jest.mock(
	'../../../../src/providers/cognito/tokenProvider/errorHelpers',
	() => ({
		assert: jest.fn(),
		TokenProviderErrorCode: 'mockErrorCode',
	}),
);
jest.mock('../../../../src/providers/cognito/apis/getCurrentUser', () => ({
	getCurrentUser: () => Promise.resolve({}),
}));

const mockedDecodeJWT = jest.mocked(decodeJWT);
mockedDecodeJWT.mockReturnValue({
	payload: {
		exp: Math.floor(Date.now() / 1000) + 3600,
		iss: authProviderISS,
		sub: userSub,
		iat: Math.floor(Date.now() / 1000),
	},
	toString: decodeJWT.toString,
});

const mockAccessToken = {
	payload: {
		exp: Math.floor(Date.now() / 1000) + 3600,
		iss: authProviderISS,
		sub: userSub,
		iat: Math.floor(Date.now() / 1000),
	},
	toString: () => `${authIDP}.${userPoolClientId}.${userSub}.accessToken`,
};

const mockIdToken = {
	payload: {
		exp: Math.floor(Date.now() / 1000) + 3600,
		iss: authProviderISS,
		sub: userSub,
		iat: Math.floor(Date.now() / 1000),
	},
	toString: () => `${authIDP}.${userPoolClientId}.${userSub}.idToken`,
};

const mockAuthToken = {
	idToken: mockIdToken,
	accessToken: mockAccessToken,
	refreshToken: 'testRefreshToken',
	clockDrift: 1000,
	username: userSub,
};

const mockAuthRequiredToken = {
	username: userSub2,
	accessToken: mockAccessToken,
	clockDrift: 5555,
};

const mockKeyValueStorage: jest.Mocked<KeyValueStorageInterface> = {
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
	addListener: jest.fn(),
};

describe('TokenStore', () => {
	let tokenStore: DefaultTokenStore;
	let keyValStorage: KeyValueStorageInterface;
	let mockStorage: Record<string, string>;

	beforeEach(() => {
		mockStorage = {};
		mockKeyValueStorage.setItem.mockImplementation(
			(key: string, value: string) => {
				mockStorage[key] = value;

				return Promise.resolve();
			},
		);
		mockKeyValueStorage.getItem.mockImplementation(key => {
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
		tokenStore = new DefaultTokenStore();
		tokenStore.setKeyValueStorage(mockKeyValueStorage);
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
			mockKeyValueStorage.getItem.mockResolvedValueOnce(mockUser);

			const result = await tokenStore.getLastAuthUser();
			expect(result).toBe(mockUser);
		});

		it('should return string username when no last auth user exists', async () => {
			mockKeyValueStorage.getItem.mockResolvedValueOnce(null);

			const result = await tokenStore.getLastAuthUser();
			expect(result).toBe('username');
		});
	});

	describe('loadTokens', () => {
		it('should load and return stored tokens', async () => {
			await tokenStore.storeTokens(mockAuthToken);
			const result = await tokenStore.loadTokens();

			expect(result).toEqual({
				accessToken: expect.objectContaining({
					payload: {
						exp: expect.any(Number),
						iat: expect.any(Number),
						iss: authProviderISS,
						sub: userSub,
					},
				}),
				idToken: expect.objectContaining({
					payload: {
						exp: expect.any(Number),
						iat: expect.any(Number),
						iss: authProviderISS,
						sub: userSub,
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
		const optionalTokenKeys = [
			[
				'idToken',
				`${authIDP}.${userPoolClientId}.${userSub2}.idToken`,
				mockIdToken.toString(),
			],
			[
				'refreshToken',
				`${authIDP}.${userPoolClientId}.${userSub2}.refreshToken`,
				'mockRefreshToken',
			],
			[
				'signInDetails',
				`${authIDP}.${userPoolClientId}.${userSub2}.signInDetails`,
				'mockSignInDetails',
			],
		];

		beforeEach(() => {
			mockKeyValueStorage.getItem.mockImplementation(key => {
				switch (key) {
					case `${authIDP}.${userPoolClientId}.${userSub2}.accessToken`:
						return Promise.resolve(
							mockAuthRequiredToken.accessToken.toString(),
						);
					case `${authIDP}.${userPoolClientId}.${userSub2}.clockDrift`:
						return Promise.resolve(mockAuthRequiredToken.clockDrift.toString());
					case `${authIDP}.${userPoolClientId}.LastAuthUser`:
						return Promise.resolve(mockAuthRequiredToken.username);
					default:
						return Promise.resolve(null);
				}
			});
		});

		it('should store tokens successfully', async () => {
			await tokenStore.storeTokens(mockAuthRequiredToken);

			const result = await tokenStore.loadTokens();

			expect(result).toEqual({
				accessToken: expect.objectContaining({
					payload: {
						exp: expect.any(Number),
						iat: expect.any(Number),
						iss: authProviderISS,
						sub: userSub,
					},
				}),
				idToken: undefined,
				username: userSub2,
				clockDrift: 5555,
				deviceMetadata: undefined,
				refreshToken: undefined,
			});
		});

		it.each(optionalTokenKeys)(
			`should clear other keys only when only optional key provided is %s`,
			async (tokenKey, _, tokenValue) => {
				const partialTokens = {
					...mockAuthRequiredToken,
					[tokenKey]: tokenValue,
				};

				await tokenStore.storeTokens(partialTokens);

				// Required Keys are not called with removeItem event
				expect(mockKeyValueStorage.removeItem).not.toHaveBeenCalledWith(
					`${authIDP}.${userPoolClientId}.${userSub2}.accessToken`,
				);
				expect(mockKeyValueStorage.removeItem).not.toHaveBeenCalledWith(
					`${authIDP}.${userPoolClientId}.LastAuthUser`,
				);
				expect(mockKeyValueStorage.removeItem).not.toHaveBeenCalledWith(
					`${authIDP}.${userPoolClientId}.${userSub2}.clockDrift`,
				);

				// Optional Keys that is absent from partialTokens should be called with removeItem event
				optionalTokenKeys.forEach(([key, keyStoragePath]) => {
					if (key !== tokenKey) {
						expect(mockKeyValueStorage.removeItem).toHaveBeenCalledWith(
							keyStoragePath,
						);
					} else {
						expect(mockKeyValueStorage.removeItem).not.toHaveBeenCalledWith(
							keyStoragePath,
						);
					}
				});
			},
		);
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

			const setOps = operations.filter(op => op.startsWith(`setItem:`)).length;
			const getOps = operations.filter(op => op.startsWith(`getItem:`)).length;
			expect(setOps).toBeGreaterThan(0);
			expect(getOps).toBeGreaterThan(0);

			const finalTokens = await tokenStore.loadTokens();
			expect(finalTokens?.refreshToken).toBe(newMockAuthToken.refreshToken);
		});
	});

	describe('setupNotify', () => {
		it('should setup a KeyValueStorageEvent listener', async () => {
			tokenStore.setupNotify();

			const spy = jest.spyOn(keyValStorage, 'addListener');
			const hubSpy = jest.spyOn(Hub, 'dispatch');

			expect(spy).toHaveBeenCalledWith(expect.any(Function));

			const listener = spy.mock.calls[0][0];

			// does nothing if key does not match
			await listener({
				key: 'foo.bar',
				oldValue: null,
				newValue: null,
			});

			expect(hubSpy).not.toHaveBeenCalled();

			// does nothing if both values are null
			await listener({
				key: `${AUTH_KEY_PREFIX}.someid.someotherId.refreshToken`,
				oldValue: null,
				newValue: null,
			});

			expect(hubSpy).not.toHaveBeenCalled();

			// dispatches signedIn on new value
			await listener({
				key: `${AUTH_KEY_PREFIX}.someid.someotherId.refreshToken`,
				newValue: '123',
				oldValue: null,
			});

			expect(hubSpy).toHaveBeenCalledWith(
				'auth',
				{ event: 'signedIn', data: {} },
				'Auth',
				AMPLIFY_SYMBOL,
				true,
			);
			hubSpy.mockClear();

			// dispatches signedOut on null newValue
			await listener({
				key: `${AUTH_KEY_PREFIX}.someid.someotherId.refreshToken`,
				newValue: null,
				oldValue: '123',
			});

			expect(hubSpy).toHaveBeenCalledWith(
				'auth',
				{ event: 'signedOut' },
				'Auth',
				AMPLIFY_SYMBOL,
				true,
			);
			hubSpy.mockClear();

			// dispatches tokenRefresh for changed value
			await listener({
				key: `${AUTH_KEY_PREFIX}.someid.someotherId.refreshToken`,
				newValue: '456',
				oldValue: '123',
			});

			expect(hubSpy).toHaveBeenCalledWith(
				'auth',
				{ event: 'tokenRefresh' },
				'Auth',
				AMPLIFY_SYMBOL,
				true,
			);
			hubSpy.mockClear();
		});
	});
});
