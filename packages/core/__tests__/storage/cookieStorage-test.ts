import { CookieStorage } from '../../src/StorageHelper';

const cookieStorageDomain = 'https://testdomain.com';

describe('Cookie Storage Unit Tests', () => {
	//defining a DOM to attach a cookie to
	Object.defineProperty(document, 'cookie', { writable: true });

	describe('Constructor methods', () => {
		test('Domain not supplied', async () => {
			const storage = new CookieStorage();
			expect(await storage.setItem('key', 'value')).toBe('value');
			expect(await storage.getItem('key')).toBe('value');
		});

		test('Samesite value is undefined', () => {
			expect(() => {
				new CookieStorage({ domain: cookieStorageDomain, sameSite: undefined });
			}).toThrowError(
				'The sameSite value of cookieStorage must be "lax", "strict" or "none"'
			);
		});

		test('Samesite value is none while secure = false', () => {
			expect(() => {
				new CookieStorage({
					domain: cookieStorageDomain,
					secure: false,
					sameSite: 'none',
				});
			}).toThrowError(
				'sameSite = None requires the Secure attribute in latest browser versions.'
			);
		});

		test('Has an expiration value', () => {
			const cookieExpires = new CookieStorage({
				domain: cookieStorageDomain,
				secure: false,
				expires: 200,
			});
			expect(cookieExpires.expires).toBe(200);
		});

		describe('Setters and getters', () => {
			const cookieStoreData = { path: '/', domain: cookieStorageDomain };
			const cookieStore = new CookieStorage(cookieStoreData);

			test('getting an item', async () => {
				await cookieStore.setItem('testKey', 'testValue');
				expect(await cookieStore.getItem('testKey')).toBe('testValue');
			});

			test('setting an item', async () => {
				expect(await cookieStore.setItem('domain', 'newdomain.com')).toBe(
					'newdomain.com'
				);
			});

			test('Clearing cookies should remove all items within the storage', async () => {
				const cookieStore = new CookieStorage(cookieStoreData);
				await cookieStore.setItem('testKey2', 'testValue');
				const tempReference = await cookieStore.getItem('testKey2');
				await cookieStore.clear();
				expect(await cookieStore.getItem('testKey2')).not.toEqual(tempReference);
			});
		});
	});
});
