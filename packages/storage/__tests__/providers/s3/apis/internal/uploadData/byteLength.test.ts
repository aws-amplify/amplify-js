// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { byteLength } from '../../../../../../src/providers/s3/apis/internal/uploadData/byteLength';

describe('byteLength', () => {
	it('returns 0 for null or undefined', () => {
		expect(byteLength(undefined)).toBe(0);
		expect(byteLength(null)).toBe(0);
	});

	it('calculates byte length correctly for ASCII strings', () => {
		expect(byteLength('hello')).toBe(5);
	});

	it('calculates byte length correctly for multi-byte characters', () => {
		expect(byteLength('èちは')).toBe(8);
	});

	it('handles Uint8Array correctly', () => {
		const input = new Uint8Array([1, 2, 3]);
		expect(byteLength(input)).toBe(3);
	});

	it('handles ArrayBuffer correctly', () => {
		const buffer = new ArrayBuffer(8);
		expect(byteLength(buffer)).toBe(8);
	});

	it('handles File object correctly', () => {
		const file = new Blob(['hello']);
		expect(byteLength(file)).toBe(5);
	});

	it('returns undefined for unsupported types', () => {
		const input = { unsupportedType: true };
		expect(byteLength(input)).toBeUndefined();
	});
});
