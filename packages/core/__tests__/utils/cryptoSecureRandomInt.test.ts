// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { cryptoSecureRandomInt } from '../../src/utils/cryptoSecureRandomInt';

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
		expect(windowSpy).toHaveBeenCalledTimes(4);
	});
});
