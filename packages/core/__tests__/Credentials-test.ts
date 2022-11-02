import { CredentialsClass as Credentials } from '../src/Credentials';
import { Amplify } from '../src/Amplify';

const session = {};

const user = {
	refreshSession: (_token, callback) => {
		callback(null, 'success');
	},
};

const storageClass = {
	removeItem() {},
	getItem() {},
};

const authClass = {
	getModuleName() {
		return 'Auth';
	},
	currentUserCredentials() {
		return Promise.resolve('cred');
	},
	currentSession() {
		return session;
	},
	currentUserPoolUser() {
		return user;
	},
	configure(config: any) {
		return config;
	},
};

const cacheClass = {
	getModuleName() {
		return 'Cache';
	},
	getItem() {
		return null;
	},
	configure(config: any) {
		return config;
	},
};

describe('Credentials test', () => {
	describe('.Auth', () => {
		it('should be undefined by default', async () => {
			const credentials = new Credentials(null);

			expect(credentials.Auth).toBeUndefined();

			expect(credentials.get()).rejects.toMatchInlineSnapshot(
				`"No Cognito Identity pool provided for unauthenticated access"`
			);
		});

		it('should be Amplify.Auth if configured through Amplify', () => {
			const credentials = new Credentials(null);

			Amplify.register(authClass);
			Amplify.register(credentials);

			Amplify.configure({});

			expect(credentials.Auth).toBe(authClass);
			expect(credentials.get()).resolves.toBe('cred');
		});
	});

	describe('configure test', () => {
		test('happy case', () => {
			const config = {
				attr: 'attr',
			};

			const credentials = new Credentials(null);
			expect(credentials.configure(config)).toEqual({
				attr: 'attr',
			});
		});
	});

	describe('getCredSource test', () => {
		test('happy case', () => {
			const credentials = new Credentials(null);
			credentials['_credentials_source'] = 'source';
			expect(credentials.getCredSource()).toBe('source');
		});
	});

	describe('token expiration test', () => {
		let credentials: Credentials;
		const timestamp = Date.now();
		const dateSpy = jest.spyOn(global.Date, 'now');
		const manualRefreshSpy = jest.spyOn(user, 'refreshSession');
		const userCredentialsSpy = jest.spyOn(authClass, 'currentUserCredentials');

		beforeAll(() => {
			Amplify.register(authClass);
			credentials = new Credentials(null);

			const ttlExpiration = timestamp + 50 * 60 * 1000; // TTL expires after 50 min
			const sessionExpiration = timestamp + 60 * 60 * 1000; // Session expires after 60 min

			credentials['_credentials'] = {
				expiration: new Date(sessionExpiration),
			};
			credentials['_nextCredentialsRefresh'] = ttlExpiration;
		});

		afterEach(() => {
			// These spies need to be cleared so they start counting # of calls from scratch
			manualRefreshSpy.mockClear();
			userCredentialsSpy.mockClear();
		});

		afterAll(() => {
			// Restore original implemenmtation for `Date.now()`
			dateSpy.mockRestore();
		});

		test('session does not refresh before TTL expires', async () => {
			const mockCurrentTime = timestamp + 45 * 60 * 1000; // before TTL expiration
			dateSpy.mockImplementation(() => mockCurrentTime); // mock current time

			await credentials.get();
			expect(manualRefreshSpy).not.toHaveBeenCalled();
			expect(userCredentialsSpy).toHaveBeenCalledTimes(1);
		});

		test('session refreshes between TTL and expiration', async () => {
			const mockCurrentTime = timestamp + 55 * 60 * 1000; // between TTL and session expiration
			dateSpy.mockImplementation(() => mockCurrentTime); // mock current time

			await credentials.get();
			expect(manualRefreshSpy).toHaveBeenCalledTimes(1);
			expect(userCredentialsSpy).toHaveBeenCalledTimes(1);
		});

		test('session refreshes after expiration and TTL', async () => {
			const mockCurrentTime = timestamp + 65 * 60 * 1000; // after session expiration
			dateSpy.mockImplementation(() => mockCurrentTime); // mock current time

			await credentials.get();
			expect(manualRefreshSpy).not.toBeCalled();
			expect(userCredentialsSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('get test', () => {
		test('credentials in the memory and not expired', async () => {
			Amplify.register(authClass);
			Amplify.register(cacheClass);
			const credentials = new Credentials(null);

			const expiration = new Date(new Date().getTime() + 20 * 60 * 1000);
			credentials['_credentials'] = {
				expiration,
			};
			credentials['_nextCredentialsRefresh'] = expiration.getTime() + 1;
			expect(await credentials.get()).toEqual(credentials['_credentials']);
		});

		test('credentials not in memory or being expired', async () => {
			Amplify.register(authClass);

			const credentials = new Credentials(null);

			expect(await credentials.get()).toBe('cred');
		});
	});

	describe('clear test', () => {
		test('credentials can be cleared from storage', async () => {
			Amplify.register(authClass);
			Amplify.register(cacheClass);
			const identityPoolId = 'IDENTITY_POOL_ID';
			const credentials = new Credentials({
				storage: storageClass,
				identityPoolId,
			});
			const removeItemSpy = jest.spyOn(storageClass, 'removeItem');

			credentials.clear();
			expect(removeItemSpy).toHaveBeenCalledTimes(1);
			expect(removeItemSpy).toHaveBeenCalledWith('aws-amplify-federatedInfo');
		});
	});
});
