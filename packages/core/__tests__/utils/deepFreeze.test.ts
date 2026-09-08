// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { deepFreeze } from '../../src/utils/deepFreeze';

describe('deepFreeze', () => {
	test('freezes simple object', () => {
		const obj = { a: 1, b: 2 };
		const frozen = deepFreeze(obj);
		expect(Object.isFrozen(frozen)).toBe(true);
	});

	test('freezes nested objects', () => {
		const obj = { a: { b: { c: 1 } } };
		const frozen = deepFreeze(obj);
		expect(Object.isFrozen(frozen)).toBe(true);
		expect(Object.isFrozen(frozen.a)).toBe(true);
		expect(Object.isFrozen(frozen.a.b)).toBe(true);
	});

	test('freezes functions', () => {
		const obj = { fn: () => 'test' };
		const frozen = deepFreeze(obj);
		expect(Object.isFrozen(frozen.fn)).toBe(true);
	});
});
