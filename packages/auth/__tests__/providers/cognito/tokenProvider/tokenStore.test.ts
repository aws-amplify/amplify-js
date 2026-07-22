// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorageInterface } from '@aws-amplify/core';
import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { DefaultTokenStore } from '../../../../src/providers/cognito/tokenProvider';

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
			// getLastAuthUser now resolves via getAuthUserList, which reads both the
			// AuthUserList key and the legacy LastAuthUser key; both must be empty.
			mockKeyValueStorage.getItem.mockResolvedValue(null);

			const result = await tokenStore.getLastAuthUser();
			expect(result).toBe('username');
		});
	});

	describe('getStoredIdToken', () => {
		it('reads and decodes the stored idToken for a specific user', async () => {
			const result = await tokenStore.getStoredIdToken(userSub);

			expect(mockKeyValueStorage.getItem).toHaveBeenCalledWith(
				`${authIDP}.${userPoolClientId}.${userSub}.idToken`,
			);
			expect(mockedDecodeJWT).toHaveBeenCalledWith(
				mockAuthToken.idToken.toString(),
			);
			expect(result?.payload.sub).toBe(userSub);
		});

		it('returns undefined when no idToken is stored', async () => {
			const result = await tokenStore.getStoredIdToken('absentUser');

			expect(result).toBeUndefined();
		});

		it('returns undefined (no throw) when decoding fails', async () => {
			mockedDecodeJWT.mockImplementationOnce(() => {
				throw new Error('bad token');
			});

			const result = await tokenStore.getStoredIdToken(userSub);

			expect(result).toBeUndefined();
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
			// isolate the getDeviceMetadata reads from storeTokens' internal
			// getLastAuthUser lookup (which now also consults the roster key).
			getItemSpy.mockClear();
			await tokenStore.getDeviceMetadata(userSub);
			expect(getItemSpy).toHaveBeenCalledTimes(3);
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

	describe('session roster (multi-session)', () => {
		const authUserListKey = `${authIDP}.${userPoolClientId}.AuthUserList`;
		const lastAuthUserKey = `${authIDP}.${userPoolClientId}.LastAuthUser`;
		// stateful in-memory storage so roster reads reflect prior writes.
		let store: Record<string, string>;

		beforeEach(() => {
			store = {};
			mockKeyValueStorage.getItem.mockImplementation((key: string) =>
				Promise.resolve(key in store ? store[key] : null),
			);
			mockKeyValueStorage.setItem.mockImplementation(
				(key: string, value: string) => {
					store[key] = value;

					return Promise.resolve();
				},
			);
			mockKeyValueStorage.removeItem.mockImplementation((key: string) => {
				delete store[key];

				return Promise.resolve();
			});
		});

		describe('getAuthUserList', () => {
			it('parses a comma-separated roster preserving order', async () => {
				store[authUserListKey] = 'alice,bob,carol';

				expect(await tokenStore.getAuthUserList()).toEqual([
					'alice',
					'bob',
					'carol',
				]);
			});

			it('migrates a legacy LastAuthUser when AuthUserList is absent', async () => {
				store[lastAuthUserKey] = 'legacyUser';

				const result = await tokenStore.getAuthUserList();

				expect(result).toEqual(['legacyUser']);
				// migration should persist the derived roster to both keys.
				expect(store[authUserListKey]).toBe('legacyUser');
				expect(store[lastAuthUserKey]).toBe('legacyUser');
			});

			it('ignores the "username" fallback sentinel and returns an empty roster', async () => {
				store[lastAuthUserKey] = 'username';

				expect(await tokenStore.getAuthUserList()).toEqual([]);
			});

			it('still returns the migrated list when persistAuthUserList throws (read-only storage)', async () => {
				store[lastAuthUserKey] = 'legacyUser';
				// Simulate read-only storage: setItem throws on write.
				mockKeyValueStorage.setItem.mockRejectedValue(
					new Error('Storage is read-only'),
				);

				const result = await tokenStore.getAuthUserList();

				// Migration still returns the derived list even though persist failed.
				expect(result).toEqual(['legacyUser']);
			});

			it('returns an empty roster when nothing is stored', async () => {
				expect(await tokenStore.getAuthUserList()).toEqual([]);
			});
		});

		describe('getLastAuthUser', () => {
			it('returns the roster head (AuthUserList[0])', async () => {
				store[authUserListKey] = 'active,parked';

				expect(await tokenStore.getLastAuthUser()).toBe('active');
			});
		});

		describe('addActiveSession', () => {
			it('adds a new user to the front of the roster', async () => {
				store[authUserListKey] = 'bob,carol';

				await tokenStore.addActiveSession('alice');

				expect(store[authUserListKey]).toBe('alice,bob,carol');
				// invariant: LastAuthUser === AuthUserList[0]
				expect(store[lastAuthUserKey]).toBe('alice');
			});

			it('dedupes and moves an existing user to the front', async () => {
				store[authUserListKey] = 'bob,carol,dave';

				await tokenStore.addActiveSession('dave');

				expect(store[authUserListKey]).toBe('dave,bob,carol');
				expect(store[lastAuthUserKey]).toBe('dave');
			});
		});

		describe('removeSession', () => {
			it('removes a user and returns the promoted head', async () => {
				store[authUserListKey] = 'alice,bob,carol';
				store[lastAuthUserKey] = 'alice';

				const result = await tokenStore.removeSession('alice');

				expect(result).toEqual({ newActiveUser: 'bob', isEmpty: false });
				expect(store[authUserListKey]).toBe('bob,carol');
				expect(store[lastAuthUserKey]).toBe('bob');
			});

			it('clears BOTH keys when the roster becomes empty', async () => {
				store[authUserListKey] = 'alice';
				store[lastAuthUserKey] = 'alice';

				const result = await tokenStore.removeSession('alice');

				expect(result).toEqual({ newActiveUser: undefined, isEmpty: true });
				expect(mockKeyValueStorage.removeItem).toHaveBeenCalledWith(
					authUserListKey,
				);
				expect(mockKeyValueStorage.removeItem).toHaveBeenCalledWith(
					lastAuthUserKey,
				);
				expect(store[authUserListKey]).toBeUndefined();
				expect(store[lastAuthUserKey]).toBeUndefined();
			});

			it('removes LastAuthUser BEFORE AuthUserList when the roster empties', async () => {
				store[authUserListKey] = 'alice';
				store[lastAuthUserKey] = 'alice';

				await tokenStore.removeSession('alice');

				// ordering guards against a failed AuthUserList delete leaving a
				// lingering legacy LastAuthUser that would re-migrate a removed user.
				const removeOrder = mockKeyValueStorage.removeItem.mock.calls
					.map(([key]) => key)
					.filter(key => key === lastAuthUserKey || key === authUserListKey);
				expect(removeOrder).toEqual([lastAuthUserKey, authUserListKey]);
			});
		});

		describe('clearTokensForUser', () => {
			it('removes only the target user namespace and not the roster keys', async () => {
				const targetUser = 'alice';
				store[authUserListKey] = 'alice,bob';
				store[lastAuthUserKey] = 'alice';

				await tokenStore.clearTokensForUser(targetUser);

				const namespacedKeys = [
					'accessToken',
					'idToken',
					'clockDrift',
					'refreshToken',
					'signInDetails',
					'deviceKey',
					'deviceGroupKey',
					'randomPasswordKey',
					'oauthMetadata',
				];
				namespacedKeys.forEach(key => {
					expect(mockKeyValueStorage.removeItem).toHaveBeenCalledWith(
						`${authIDP}.${userPoolClientId}.${targetUser}.${key}`,
					);
				});
				// roster pointers must remain untouched.
				expect(mockKeyValueStorage.removeItem).not.toHaveBeenCalledWith(
					lastAuthUserKey,
				);
				expect(mockKeyValueStorage.removeItem).not.toHaveBeenCalledWith(
					authUserListKey,
				);
			});
		});

		describe('storeTokens', () => {
			it('does not write the LastAuthUser or AuthUserList roster keys', async () => {
				await tokenStore.storeTokens(mockAuthToken);

				expect(mockKeyValueStorage.setItem).not.toHaveBeenCalledWith(
					lastAuthUserKey,
					expect.anything(),
				);
				expect(mockKeyValueStorage.setItem).not.toHaveBeenCalledWith(
					authUserListKey,
					expect.anything(),
				);
			});
		});
	});
});
