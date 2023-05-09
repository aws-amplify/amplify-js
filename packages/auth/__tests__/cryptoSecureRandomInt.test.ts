// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import crypto from 'crypto';
import cryptoSecureRandomInt from '../src/providers/cognito/utils/srp/cryptoSecureRandomInt';

describe('cryptoSecureRandomInt test', () => {
	let windowSpy: any;

	beforeEach(() => {
		jest.resetModules();
		windowSpy = jest.spyOn(window, 'window', 'get');
	});

	afterEach(() => {
		windowSpy.mockRestore();
	});

	test('crypto is set for window (browser)', () => {
		windowSpy.mockImplementation(() => ({
			crypto: {
				getRandomValues: () => [12345],
			},
		}));

		expect(window.crypto).toBeTruthy();
		expect(cryptoSecureRandomInt()).toBe(12345);
	});

	test('crypto is set for window (IE 11)', () => {
		windowSpy.mockImplementation(() => ({
			crypto: undefined,
			msCrypto: {
				getRandomValues: () => [67890],
			},
		}));

		expect((window as any).msCrypto).toBeTruthy();
		expect(cryptoSecureRandomInt()).toBe(67890);
	});

	test('crypto is set for Node', () => {
		windowSpy.mockImplementation(() => ({
			crypto: null,
		}));

		const randomBytesMock = jest
			.spyOn(crypto, 'randomBytes')
			.mockImplementationOnce(() => ({
				readInt32LE: jest.fn().mockReturnValueOnce(54321),
			}));

		expect(cryptoSecureRandomInt()).toBe(54321);

		randomBytesMock.mockRestore();
	});
});
