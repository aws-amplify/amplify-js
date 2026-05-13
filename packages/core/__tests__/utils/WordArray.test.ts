// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { WordArray } from '../../src/utils/WordArray';

describe('WordArray', () => {
	test('creates empty WordArray', () => {
		const wa = new WordArray();
		expect(wa.words).toEqual([]);
		expect(wa.sigBytes).toBe(0);
	});

	test('creates WordArray with words', () => {
		const wa = new WordArray([0x12345678, 0x9abcdef0]);
		expect(wa.words).toEqual([0x12345678, 0x9abcdef0]);
		expect(wa.sigBytes).toBe(8);
	});

	test('creates WordArray with custom sigBytes', () => {
		const wa = new WordArray([0x12345678], 3);
		expect(wa.sigBytes).toBe(3);
	});

	test('random generates WordArray', () => {
		const wa = new WordArray();
		const random = wa.random(8);
		expect(random.words.length).toBe(2);
		expect(random.sigBytes).toBe(8);
	});

	test('toString converts to hex', () => {
		const wa = new WordArray([0x12345678], 4);
		const hex = wa.toString();
		expect(hex).toBe('12345678');
	});

	test('toString handles partial bytes', () => {
		const wa = new WordArray([0x12345678], 2);
		const hex = wa.toString();
		expect(hex).toBe('1234');
	});
});
