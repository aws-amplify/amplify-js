// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyError } from '../../../src/errors';
import { getAtob, getBtoa, getCrypto } from '../../../src/utils/globalHelpers';

describe('getGlobal', () => {
	let mockWindow: jest.SpyInstance;

	beforeAll(() => {
		mockWindow = jest.spyOn(window, 'window', 'get');
	});

	describe('getCrypto()', () => {
		afterEach(() => {
			mockWindow.mockReset();
			Object.defineProperty(global, 'crypto', {
				value: undefined,
				writable: true,
			});
		});

		it('returns window.crypto when it is available', () => {
			const mockCrypto = {
				getRandomValues: jest.fn(),
			};
			mockWindow.mockImplementation(() => ({
				crypto: mockCrypto,
			}));

			expect(getCrypto()).toEqual(mockCrypto);
		});

		it('returns the global crypto when it is available', () => {
			const mockCrypto = {
				getRandomValues: jest.fn(),
			};

			mockWindow.mockImplementation(() => undefined);
			Object.defineProperty(global, 'crypto', {
				value: mockCrypto,
				writable: true,
			});

			expect(getCrypto()).toEqual(mockCrypto);
		});

		// it('should throw error if crypto is unavailable globally', () => {
		// 	mockWindow.mockImplementation(() => undefined);

		// 	expect(() => getCrypto()).toThrow(AmplifyError);
		// });
	});

	describe('getBtoa()', () => {
		afterEach(() => {
			mockWindow.mockReset();
			Object.defineProperty(global, 'btoa', {
				value: undefined,
				writable: true,
			});
		});

		it('returns window.btoa when it is available', () => {
			const mockBtoa = jest.fn();
			mockWindow.mockImplementation(() => ({
				btoa: mockBtoa,
			}));

			expect(getBtoa()).toEqual(mockBtoa);
		});

		it('returns the global btoa when it is available', () => {
			const mockBtoA = jest.fn();
			mockWindow.mockImplementation(() => undefined);
			Object.defineProperty(global, 'btoa', {
				value: mockBtoA,
				writable: true,
			});

			expect(getBtoa()).toEqual(mockBtoA);
		});

		it('throws error if crypto is unavailable globally', () => {
			mockWindow.mockImplementation(() => undefined);

			expect(() => getBtoa()).toThrow(AmplifyError);
		});
	});

	describe('getAtob()', () => {
		afterEach(() => {
			mockWindow.mockReset();
			Object.defineProperty(global, 'atob', {
				value: undefined,
				writable: true,
			});
		});

		it('returns window.atob when it is available', () => {
			const mockAtoB = jest.fn();
			mockWindow.mockImplementation(() => ({
				atob: mockAtoB,
			}));

			expect(getAtob()).toEqual(mockAtoB);
		});

		it('returns the global atob when it is available', () => {
			const mockAtoB = jest.fn();
			mockWindow.mockImplementation(() => undefined);
			Object.defineProperty(global, 'atob', {
				value: mockAtoB,
				writable: true,
			});

			expect(getAtob()).toEqual(mockAtoB);
		});

		it('throws error if atob is unavailable globally', () => {
			mockWindow.mockImplementation(() => undefined);

			expect(() => getAtob()).toThrow(AmplifyError);
		});
	});
});
