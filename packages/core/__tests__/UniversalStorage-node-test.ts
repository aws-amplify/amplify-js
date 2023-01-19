/**
 * @jest-environment node
 */
const mockCookiesRemove = jest.fn();
const mockCookiesSet = jest.fn();
const mockCookiesGet = jest.fn();
const mockCookiesGetAll = jest.fn();
const mockCookies = jest.fn().mockImplementation(function () {
	return {
		remove: mockCookiesRemove,
		set: mockCookiesSet,
		get: mockCookiesGet,
		getAll: mockCookiesGetAll,
	};
});
jest.mock('universal-cookie', () => ({
	default: mockCookies,
}));
jest.mock('../src/JS', () => ({
	browserOrNode: jest.fn().mockReturnValue({
		isBrowser: false,
		isNode: true,
	}),
}));

import { UniversalStorage } from '../src/UniversalStorage';

describe(UniversalStorage.name, () => {
	describe('on server side', () => {
		let universalStorage: UniversalStorage;
		let mockStore = {};

		beforeEach(() => {
			jest.clearAllMocks();
			mockCookiesGetAll.mockReturnValue({});
			universalStorage = new UniversalStorage();
			mockStore = {};
			universalStorage.store = mockStore;
		});

		describe('constructor', () => {
			test('initiate store with cookies', () => {
				mockCookiesGetAll.mockReturnValue({ bar: 'barz' });
				const universalStorage = new UniversalStorage();
				expect(universalStorage.store).toMatchObject({ bar: 'barz' });
			});
		});

		describe('setItem', () => {
			test('sets item in local storage', () => {
				universalStorage.setItem('foo', 'bar');
				expect(universalStorage.store).toMatchObject({ foo: 'bar' });
			});

			// Unlike in browser, cookies on server side are always secure.
			test.each([
				['LastAuthUser'],
				['accessToken'],
				['refreshToken'],
				['idToken'],
			])('sets session token %s to secure permenent cookie', tokenType => {
				const key = `ProviderName.someid.someid.${tokenType}`;
				const value = `${tokenType}-value`;
				universalStorage.setItem(key, value);
				expect(mockCookiesSet).toBeCalledWith(
					key,
					value,
					expect.objectContaining({ path: '/', sameSite: true, secure: true })
				);
				expect(mockCookiesSet.mock.calls.length).toBe(1);
				const expiresParam = mockCookiesSet.mock.calls[0]?.[2]?.expires;
				expect(expiresParam).toBeInstanceOf(Date);
				expect(expiresParam.valueOf()).toBeGreaterThan(Date.now());
			});
		});

		describe('getItem', () => {
			test('returns corresponding item from store', () => {
				universalStorage.store['foo'] = 'bar';
				expect(universalStorage.getItem('foo')).toBe('bar');
			});
		});

		describe('key', () => {
			test('returns key from store in insertion order', () => {
				universalStorage.store['foo'] = 'bar';
				universalStorage.store['baz'] = 'qux';
				expect(universalStorage.key(0)).toBe('foo');
				expect(universalStorage.key(1)).toBe('baz');
			});
		});

		describe('removeItem', () => {
			test('should remove item from local store', () => {
				universalStorage.setItem('foo', 'bar');
				universalStorage.removeItem('foo');
				expect(Object.keys(universalStorage.store).length).toBe(0);
			});

			test('should remove item from cookies', () => {
				universalStorage.setItem('foo', 'bar');
				universalStorage.removeItem('foo');
				expect(mockCookiesRemove).toBeCalledWith('foo', { path: '/' });
			});
		});

		describe('clear', () => {
			test('removes all items in store', () => {
				const mockRemoveItem = spyOn(universalStorage, 'removeItem');
				universalStorage.setItem('foo', 'bar');
				universalStorage.setItem('quz', 'baz');
				universalStorage.clear();
				expect(mockRemoveItem).toBeCalledTimes(2);
				expect(mockRemoveItem).toHaveBeenNthCalledWith(1, 'foo');
				expect(mockRemoveItem).toHaveBeenNthCalledWith(2, 'quz');
			});
		});
	});
});
