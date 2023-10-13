// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { enableFetchMocks } from 'jest-fetch-mock';

// Make global Request available during test
enableFetchMocks();

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createCookieStorageAdapterFromNextServerContext } from '../../src/utils';
import { DATE_IN_THE_PAST } from '../../src/utils/createCookieStorageAdapterFromNextServerContext';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

jest.mock('next/headers', () => ({
	cookies: jest.fn(),
}));

const mockNextCookiesFunc = cookies as jest.Mock;

describe('createCookieStorageAdapterFromNextServerContext', () => {
	const mockGetFunc = jest.fn();
	const mockGetAllFunc = jest.fn();
	const mockSetFunc = jest.fn();
	const mockDeleteFunc = jest.fn();
	const mockAppend = jest.fn();
	const mockNextCookiesFuncReturn = {
		get: jest.fn(),
		getAll: jest.fn(),
		set: jest.fn(),
		delete: jest.fn(),
	};

	const mockKey = 'key';
	const mockKeyWithEncoding = 'test%40email.com';
	const mockValue = 'fabCookie';

	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('cookieStorageAdapter created from NextRequest and NextResponse', () => {
		const request = new NextRequest(new URL('https://example.com'));
		const response = NextResponse.next();

		jest.spyOn(request, 'cookies', 'get').mockImplementation(
			() =>
				({
					get: mockGetFunc,
					getAll: mockGetAllFunc,
				} as any)
		);

		jest.spyOn(response, 'cookies', 'get').mockImplementation(() => ({
			set: mockSetFunc,
			delete: mockDeleteFunc,
			get: jest.fn(),
			getAll: jest.fn(),
			has: jest.fn(),
		}));

		const mockContext = {
			request,
			response,
		} as any;

		const result = createCookieStorageAdapterFromNextServerContext(mockContext);

		it('gets cookie by calling `get` method of the underlying cookie store', () => {
			result.get(mockKey);
			expect(mockGetFunc).toHaveBeenCalledWith(mockKey);
		});

		it('gets cookie by calling `get` method of the underlying cookie store with a encoded cookie name', () => {
			result.get(mockKeyWithEncoding);
			expect(mockGetFunc).toHaveBeenCalledWith(
				encodeURIComponent(mockKeyWithEncoding)
			);
		});

		it('gets all cookies by calling `getAll` method of the underlying cookie store', () => {
			result.getAll();
			expect(mockGetAllFunc).toHaveBeenCalled();
		});

		it('sets cookie by calling the `set` method of the underlying cookie store', () => {
			result.set(mockKey, mockValue);
			expect(mockSetFunc).toHaveBeenCalledWith(
				mockKey,
				mockValue,
				undefined /* didn't specify the options param in the call */
			);
		});

		it('sets cookie by calling the `set` method of the underlying cookie store with a encoded cookie name', () => {
			result.set(mockKeyWithEncoding, mockValue, { sameSite: 'lax' });
			expect(mockSetFunc).toHaveBeenCalledWith(
				encodeURIComponent(mockKeyWithEncoding),
				mockValue,
				{ sameSite: 'lax' }
			);
		});

		it('deletes cookie by calling  the `delete` method of the underlying cookie store', () => {
			result.delete(mockKey);
			expect(mockDeleteFunc).toHaveBeenCalledWith(mockKey);
		});

		it('deletes cookie by calling  the `delete` method of the underlying cookie store with a encoded cookie name', () => {
			result.delete(mockKeyWithEncoding);
			expect(mockDeleteFunc).toHaveBeenCalledWith(
				encodeURIComponent(mockKeyWithEncoding)
			);
		});
	});

	describe('cookieStorageAdapter created from NextRequest and Response', () => {
		const request = new NextRequest(new URL('https://example.com'));
		const response = new Response();

		jest.spyOn(request, 'cookies', 'get').mockImplementation(
			() =>
				({
					get: mockGetFunc,
					getAll: mockGetAllFunc,
				} as any)
		);
		jest.spyOn(response, 'headers', 'get').mockImplementation(
			() =>
				({
					append: mockAppend,
				} as any)
		);

		const mockContext = {
			request,
			response,
		} as any;

		const mockSerializeOptions = {
			domain: 'example.com',
			expires: new Date('2023-08-22'),
			sameSite: 'strict' as any,
			httpOnly: true,
			secure: true,
		};

		const result = createCookieStorageAdapterFromNextServerContext(mockContext);

		it('gets cookie by calling `get` method of the underlying cookie store', () => {
			result.get(mockKey);
			expect(mockGetFunc).toHaveBeenCalledWith(mockKey);
		});

		it('gets cookie by calling `get` method of the underlying cookie store with a encoded cookie name', () => {
			result.get(mockKeyWithEncoding);
			expect(mockGetFunc).toHaveBeenCalledWith(
				encodeURIComponent(mockKeyWithEncoding)
			);
		});

		it('gets all cookies by calling `getAll` method of the underlying cookie store', () => {
			result.getAll();
			expect(mockGetAllFunc).toHaveBeenCalled();
		});

		it('sets cookie by calling the `set` method of the underlying cookie store with options', () => {
			result.set(mockKey, mockValue, mockSerializeOptions);
			expect(mockAppend).toHaveBeenCalledWith(
				'Set-Cookie',
				`${mockKey}=${mockValue};Domain=${
					mockSerializeOptions.domain
				};Expires=${mockSerializeOptions.expires.toUTCString()};HttpOnly;SameSite=${
					mockSerializeOptions.sameSite
				};Secure`
			);
		});

		it('sets cookie by calling the `set` method of the underlying cookie store with options and a encoded cookie name', () => {
			result.set(mockKeyWithEncoding, mockValue, mockSerializeOptions);
			expect(mockAppend).toHaveBeenCalledWith(
				'Set-Cookie',
				`${encodeURIComponent(mockKeyWithEncoding)}=${mockValue};Domain=${
					mockSerializeOptions.domain
				};Expires=${mockSerializeOptions.expires.toUTCString()};HttpOnly;SameSite=${
					mockSerializeOptions.sameSite
				};Secure`
			);
		});

		it('sets cookie by calling the `set` method of the underlying cookie store without options', () => {
			result.set(mockKey, mockValue, undefined);
			expect(mockAppend).toHaveBeenCalledWith(
				'Set-Cookie',
				`${mockKey}=${mockValue};`
			);
		});

		it('sets cookie by calling the `set` method of the underlying cookie store with options that do not need to be serialized', () => {
			result.set(mockKey, mockValue, {
				httpOnly: false,
				sameSite: false,
				secure: false,
			});
			expect(mockAppend).toHaveBeenCalledWith(
				'Set-Cookie',
				`${mockKey}=${mockValue};`
			);
		});

		it('deletes cookie by calling  the `delete` method of the underlying cookie store', () => {
			result.delete(mockKey);
			expect(mockAppend).toHaveBeenCalledWith(
				'Set-Cookie',
				`${mockKey}=;Expires=${DATE_IN_THE_PAST.toUTCString()}`
			);
		});

		it('deletes cookie by calling  the `delete` method of the underlying cookie store with a encoded cookie name', () => {
			result.delete(mockKeyWithEncoding);
			expect(mockAppend).toHaveBeenCalledWith(
				'Set-Cookie',
				`${encodeURIComponent(
					mockKeyWithEncoding
				)}=;Expires=${DATE_IN_THE_PAST.toUTCString()}`
			);
		});
	});

	describe('cookieStorageAdapter created from Next cookies function', () => {
		mockNextCookiesFunc.mockReturnValueOnce(mockNextCookiesFuncReturn);

		const result = createCookieStorageAdapterFromNextServerContext({ cookies });

		it('gets cookie by calling `get` method of the underlying cookie store', () => {
			result.get(mockKey);
			expect(mockNextCookiesFuncReturn.get).toHaveBeenCalledWith(mockKey);
		});

		it('gets cookie by calling `get` method of the underlying cookie store with a encoded cookie name', () => {
			result.get(mockKeyWithEncoding);
			expect(mockNextCookiesFuncReturn.get).toHaveBeenCalledWith(
				encodeURIComponent(mockKeyWithEncoding)
			);
		});

		it('gets all cookies by calling `getAll` method of the underlying cookie store', () => {
			result.getAll();
			expect(mockNextCookiesFuncReturn.getAll).toHaveBeenCalled();
		});

		it('sets cookie by calling the `set` method of the underlying cookie store', () => {
			result.set(mockKey, mockValue);
			expect(mockNextCookiesFuncReturn.set).toHaveBeenCalledWith(
				mockKey,
				mockValue,
				undefined
			);
		});

		it('sets cookie by calling the `set` method of the underlying cookie store with a encoded cookie name', () => {
			result.set(mockKeyWithEncoding, mockValue);
			expect(mockNextCookiesFuncReturn.set).toHaveBeenCalledWith(
				encodeURIComponent(mockKeyWithEncoding),
				mockValue,
				undefined
			);
		});

		it('deletes cookie by calling  the `delete` method of the underlying cookie store', () => {
			result.delete(mockKey);
			expect(mockNextCookiesFuncReturn.delete).toHaveBeenCalledWith(mockKey);
		});

		it('deletes cookie by calling  the `delete` method of the underlying cookie store with a encoded cookie name', () => {
			result.delete(mockKeyWithEncoding);
			expect(mockNextCookiesFuncReturn.delete).toHaveBeenCalledWith(
				encodeURIComponent(mockKeyWithEncoding)
			);
		});
	});

	describe('cookieStorageAdapter created from IncomingMessage and ServerResponse as the Pages Router context', () => {
		it('operates with the underlying cookie store', () => {
			const mockCookies = {
				key1: 'value1',
				key2: 'value2',
			};

			const request = new IncomingMessage(new Socket());
			const response = new ServerResponse(request);
			const setHeaderSpy = jest.spyOn(response, 'setHeader');

			Object.defineProperty(request, 'cookies', {
				get() {
					return mockCookies;
				},
			});

			const result = createCookieStorageAdapterFromNextServerContext({
				request: request as any,
				response,
			});

			expect(result.get('key1')).toEqual({ name: 'key1', value: 'value1' });
			expect(result.get('non-exist')).toBeUndefined();
			expect(result.getAll()).toEqual([
				{ name: 'key1', value: 'value1' },
				{ name: 'key2', value: 'value2' },
			]);

			result.set('key3', 'value3');
			expect(setHeaderSpy).toHaveBeenCalledWith('Set-Cookie', 'key3=value3;');

			result.set('key4', 'value4', {
				httpOnly: true,
			});
			expect(setHeaderSpy).toHaveBeenCalledWith(
				'Set-Cookie',
				'key4=value4;HttpOnly'
			);

			result.delete('key3');
			expect(setHeaderSpy).toHaveBeenCalledWith(
				'Set-Cookie',
				`key3=;Expires=${DATE_IN_THE_PAST.toUTCString()}`
			);
		});

		it('operates with the underlying cookie store with encoded cookie names', () => {
			// these the auth keys generated by Amplify
			const encodedCookieName1 = encodeURIComponent('test@email.com.idToken');
			const encodedCookieName2 = encodeURIComponent(
				'test@email.com.refreshToken'
			);

			const mockCookies = {
				// these keys are generate by js-cookie used on the client side
				[encodeURIComponent(encodedCookieName1)]: 'value1',
				[encodeURIComponent(encodedCookieName2)]: 'value2',
			};

			const request = new IncomingMessage(new Socket());
			const response = new ServerResponse(request);
			const setHeaderSpy = jest.spyOn(response, 'setHeader');

			Object.defineProperty(request, 'cookies', {
				get() {
					return mockCookies;
				},
			});

			const result = createCookieStorageAdapterFromNextServerContext({
				request: request as any,
				response,
			});

			expect(result.get(encodedCookieName1)).toEqual({
				name: encodedCookieName1,
				value: 'value1',
			});
			expect(result.get('non-exist')).toBeUndefined();
			expect(result.getAll()).toEqual([
				// these keys are generate by js-cookie used on the client side
				{ name: encodeURIComponent(encodedCookieName1), value: 'value1' },
				{ name: encodeURIComponent(encodedCookieName2), value: 'value2' },
			]);

			result.set('key3', 'value3');
			expect(setHeaderSpy).toHaveBeenCalledWith('Set-Cookie', 'key3=value3;');

			result.set('key4', 'value4', {
				httpOnly: true,
			});

			const encodedCookieName = encodeURIComponent(
				'test@email.com.somethingElse'
			);
			result.set(encodeURIComponent('test@email.com.somethingElse'), 'value5');
			expect(setHeaderSpy).toHaveBeenCalledWith(
				'Set-Cookie',
				`${encodeURIComponent(encodedCookieName)}=value5;`
			);

			result.delete('key3');
			expect(setHeaderSpy).toHaveBeenCalledWith(
				'Set-Cookie',
				`key3=;Expires=${DATE_IN_THE_PAST.toUTCString()}`
			);
		});
	});

	it('should throw error when no cookie storage adapter is created from the context', () => {
		expect(() =>
			createCookieStorageAdapterFromNextServerContext({
				request: undefined,
				response: new ServerResponse({} as any),
			} as any)
		).toThrowError();
	});
});
