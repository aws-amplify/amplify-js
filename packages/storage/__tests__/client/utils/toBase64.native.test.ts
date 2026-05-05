// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { toBase64 } from '../../../src/client/utils/toBase64.native';

describe('client/utils/toBase64.native (React Native)', () => {
	it('encodes an ASCII string', () => {
		expect(toBase64('hello')).toBe('aGVsbG8=');
	});

	it('encodes an empty string', () => {
		expect(toBase64('')).toBe('');
	});

	it('encodes a multi-byte UTF-8 string correctly', () => {
		expect(toBase64('héllo')).toBe('aMOpbGxv');
	});

	it('encodes a Uint8Array', () => {
		const bytes = new Uint8Array([104, 101, 108, 108, 111]);
		expect(toBase64(bytes)).toBe('aGVsbG8=');
	});

	it('encodes an empty ArrayBufferView', () => {
		expect(toBase64(new Uint8Array())).toBe('');
	});
});
