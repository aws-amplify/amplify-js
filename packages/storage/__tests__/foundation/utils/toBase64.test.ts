// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TextEncoder as TextEncoderPolyfill } from 'node:util';

import { toBase64 } from '../../../src/foundation/utils/toBase64';

// jsdom does not expose `TextEncoder` globally; polyfill it from node:util so
// the foundation implementation under test can resolve it.
global.TextEncoder = TextEncoderPolyfill as any;

describe('foundation/utils/toBase64', () => {
	it('encodes an ASCII string', () => {
		expect(toBase64('hello')).toBe('aGVsbG8=');
	});

	it('encodes an empty string', () => {
		expect(toBase64('')).toBe('');
	});

	it('encodes a multi-byte UTF-8 string correctly', () => {
		// "héllo" — 'é' is 0xC3 0xA9 in UTF-8
		expect(toBase64('héllo')).toBe('aMOpbGxv');
	});

	it('encodes a Uint8Array', () => {
		const bytes = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
		expect(toBase64(bytes)).toBe('aGVsbG8=');
	});

	it('encodes a Uint8Array view over an offset into an ArrayBuffer', () => {
		const { buffer } = new Uint8Array([0, 0, 104, 101, 108, 108, 111, 0]);
		const view = new Uint8Array(buffer, 2, 5); // "hello"
		expect(toBase64(view)).toBe('aGVsbG8=');
	});

	it('encodes an empty ArrayBufferView', () => {
		expect(toBase64(new Uint8Array())).toBe('');
	});
});
