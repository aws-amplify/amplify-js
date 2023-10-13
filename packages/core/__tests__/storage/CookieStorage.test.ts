import { CookieStorage } from '../../src/storage/CookieStorage';

const cookieStorageDomain = 'https://testdomain.com';

describe('CookieStorage', () => {
	//defining a DOM to attach a cookie to
	Object.defineProperty(document, 'cookie', { writable: true });

	describe('Constructor methods', () => {
		it('should instantiate without any parameters', async () => {
			const storage = new CookieStorage();
			await storage.setItem('key', 'value');
			expect(await storage.getItem('key')).toBe('value');
		});

		it('should throw error if sameSite property exists but value is invalid', () => {
			const expectedError =
				'The sameSite value of cookieStorage must be "lax", "strict" or "none"';
			expect(() => {
				new CookieStorage({ sameSite: undefined });
			}).toThrowError(expectedError);
			expect(() => {
				new CookieStorage({ sameSite: 'foo' as any });
			}).toThrowError(expectedError);
		});

		it('SameSite value is "none" while secure is false', () => {
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

		it('Has an expiration value', () => {
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

			it('setting and getting an item', async () => {
				await cookieStore.setItem('testKey', 'testValue');
				expect(await cookieStore.getItem('testKey')).toBe('testValue');
			});

			it('setting and getting an item with encoded cookie name', async () => {
				const testKey = encodeURIComponent('test@email.com');
				const testValue = '123';
				await cookieStore.setItem(testKey, testValue);
				console.log(document.cookie);
				expect(await cookieStore.getItem(testKey)).toEqual(testValue);
			});

			it('Clearing cookies should remove all items within the storage', async () => {
				const cookieStore = new CookieStorage(cookieStoreData);
				await cookieStore.setItem('testKey2', 'testValue');
				const tempReference = await cookieStore.getItem('testKey2');
				await cookieStore.clear();
				expect(await cookieStore.getItem('testKey2')).not.toEqual(
					tempReference
				);
			});
		});
	});
});
