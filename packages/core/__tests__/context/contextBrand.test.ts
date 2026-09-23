// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AMPLIFY_CONTEXT_BRAND, isAmplifyContext } from '../../src';

describe('contextBrand', () => {
	describe('AMPLIFY_CONTEXT_BRAND', () => {
		it('is a symbol', () => {
			expect(typeof AMPLIFY_CONTEXT_BRAND).toBe('symbol');
		});

		it('uses Symbol.for so it is shared across module instances', () => {
			expect(AMPLIFY_CONTEXT_BRAND).toBe(Symbol.for('amplify.context'));
		});
	});

	describe('isAmplifyContext', () => {
		it('returns true for branded context', () => {
			const ctx = { [AMPLIFY_CONTEXT_BRAND]: true };
			expect(isAmplifyContext(ctx)).toBe(true);
		});

		it('returns false for null', () => {
			expect(isAmplifyContext(null)).toBe(false);
		});

		it('returns false for undefined', () => {
			expect(isAmplifyContext(undefined)).toBe(false);
		});

		it('returns false for non-object', () => {
			expect(isAmplifyContext('string')).toBe(false);
			expect(isAmplifyContext(123)).toBe(false);
		});

		it('returns false for object without brand', () => {
			expect(isAmplifyContext({})).toBe(false);
		});

		it('returns true for array with brand property', () => {
			// Arrays are objects and `in` operator finds the key
			const arr: any = [];
			arr[AMPLIFY_CONTEXT_BRAND] = true;
			expect(isAmplifyContext(arr)).toBe(true);
		});

		it('returns true when brand value is any truthy value (not just true)', () => {
			// `in` operator only checks key existence, not value
			expect(isAmplifyContext({ [AMPLIFY_CONTEXT_BRAND]: 'anything' })).toBe(
				true,
			);
		});

		it('returns false for function with brand', () => {
			// functions are typeof 'object' === false
			const fn: any = () => undefined;
			fn[AMPLIFY_CONTEXT_BRAND] = true;
			expect(isAmplifyContext(fn)).toBe(false);
		});
	});
});
