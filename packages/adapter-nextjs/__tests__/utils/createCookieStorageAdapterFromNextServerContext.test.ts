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

	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('it should return cookieStorageAdapter from NextRequest and NextResponse', () => {
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
		const mockKey = 'key';
		const mockValue = 'cookieName=value';
		result.get(mockKey);
		expect(mockGetFunc).toHaveBeenCalledWith(mockKey);

		result.getAll();
		expect(mockGetAllFunc).toHaveBeenCalled();

		result.set(mockKey, mockValue);
		expect(mockSetFunc).toHaveBeenCalledWith(mockKey, mockValue);

		result.delete(mockKey);
		expect(mockDeleteFunc).toHaveBeenCalledWith(mockKey);
	});

	it('should return cookieStorageAdapter from NextRequest and Response', () => {
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

		const result = createCookieStorageAdapterFromNextServerContext(mockContext);
		const mockKey = 'key';
		const mockValue = '123';

		result.get(mockKey);
		expect(mockGetFunc).toHaveBeenCalledWith(mockKey);

		result.getAll();
		expect(mockGetAllFunc).toHaveBeenCalled();

		const mockSerializeOptions = {
			domain: 'example.com',
			expires: new Date('2023-08-22'),
			sameSite: 'strict' as any,
			httpOnly: true,
			secure: true,
		};
		result.set(mockKey, mockValue, mockSerializeOptions);
		expect(mockAppend).toHaveBeenCalledWith(
			'Set-Cookie',
			`${mockKey}=${mockValue};Domain=${
				mockSerializeOptions.domain
			};Expires=${mockSerializeOptions.expires.toUTCString()};HttpOnly;SameSite=${
				mockSerializeOptions.sameSite
			};Secure`
		);

		result.set(mockKey, mockValue, undefined);
		expect(mockAppend).toHaveBeenCalledWith(
			'Set-Cookie',
			`${mockKey}=${mockValue};`
		);

		result.set(mockKey, mockValue, {
			httpOnly: false,
			sameSite: false,
			secure: false,
		});
		expect(mockAppend).toHaveBeenCalledWith(
			'Set-Cookie',
			`${mockKey}=${mockValue};`
		);

		result.delete(mockKey);
		expect(mockAppend).toHaveBeenCalledWith(
			'Set-Cookie',
			`${mockKey}=;Expires=${DATE_IN_THE_PAST.toUTCString()}`
		);
	});

	it('should return cookieStorageAdapter from Next cookies function', () => {
		mockNextCookiesFunc.mockReturnValueOnce(mockNextCookiesFuncReturn);

		const result = createCookieStorageAdapterFromNextServerContext({ cookies });

		const mockKey = 'key';
		const mockValue = '123';

		result.get(mockKey);
		expect(mockNextCookiesFuncReturn.get).toHaveBeenCalledWith(mockKey);

		result.getAll();
		expect(mockNextCookiesFuncReturn.getAll).toHaveBeenCalled();

		result.set(mockKey, mockValue);
		expect(mockNextCookiesFuncReturn.set).toHaveBeenCalledWith(
			mockKey,
			mockValue,
			undefined
		);

		result.delete(mockKey);
		expect(mockNextCookiesFuncReturn.delete).toHaveBeenCalledWith(mockKey);
	});

	it('should return cookieStorageAdapter from IncomingMessage and ServerResponse as the Pages Router context', () => {
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

	it('should throw error when no cookie storage adapter is created from the context', () => {
		expect(() =>
			createCookieStorageAdapterFromNextServerContext({
				request: undefined,
				response: new ServerResponse({} as any),
			} as any)
		).toThrowError();
	});
});
