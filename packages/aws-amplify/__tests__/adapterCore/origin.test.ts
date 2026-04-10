// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isSSLOrigin, isValidOrigin } from '../../src/adapter-core/origin';

describe('origin', () => {
	describe('isValidOrigin', () => {
		it('returns true for https', () => {
			expect(isValidOrigin('https://example.com')).toBe(true);
		});

		it('returns true for http localhost', () => {
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
			expect(isValidOrigin('http://localhost:3000')).toBe(true);
			warnSpy.mockRestore();
		});

		it('warns for non-localhost http', () => {
			const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
			expect(isValidOrigin('http://example.com')).toBe(true);
			expect(warnSpy).toHaveBeenCalled();
			warnSpy.mockRestore();
		});

		it('returns false for undefined', () => {
			expect(isValidOrigin(undefined)).toBe(false);
		});

		it('returns false for invalid url', () => {
			expect(isValidOrigin('not-a-url')).toBe(false);
		});
	});

	describe('isSSLOrigin', () => {
		it('returns true for https', () => {
			expect(isSSLOrigin('https://example.com')).toBe(true);
		});

		it('returns false for http', () => {
			jest.spyOn(console, 'warn').mockImplementation();
			expect(isSSLOrigin('http://example.com')).toBe(false);
		});

		it('returns false for undefined', () => {
			expect(isSSLOrigin(undefined)).toBe(false);
		});
	});
});
