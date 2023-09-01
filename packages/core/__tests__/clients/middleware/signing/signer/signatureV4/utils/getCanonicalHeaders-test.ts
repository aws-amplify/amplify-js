// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getCanonicalHeaders } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getCanonicalHeaders';

describe('getCanonicalHeaders', () => {
	test('lowercases keys', () => {
		const headers = { BAR: 'BAR', fOo: 'fOo' };
		expect(getCanonicalHeaders(headers)).toBe('bar:BAR\nfoo:fOo\n');
	});

	test('trims values', () => {
		const headers = { foobar: '   f   o o b  a   r   ' };
		expect(getCanonicalHeaders(headers)).toBe('foobar:f o o b a r\n');
	});

	test('sorts by keys', () => {
		const headers = { baz: 'baz', foo: 'foo', bar: 'bar' };
		expect(getCanonicalHeaders(headers)).toBe('bar:bar\nbaz:baz\nfoo:foo\n');
	});

	test('handles empty headers', () => {
		const headers = {};
		expect(getCanonicalHeaders(headers)).toBe('');
	});
});
