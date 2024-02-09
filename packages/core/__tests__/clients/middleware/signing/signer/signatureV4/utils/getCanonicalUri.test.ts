// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getCanonicalUri } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getCanonicalUri';

describe('getCanonicalUri', () => {
	test('returns a canonical uri', () => {
		const path = '/foo/bar/baz';
		expect(getCanonicalUri(path)).toBe(path);
	});

	test('handles empty path', () => {
		expect(getCanonicalUri('')).toBe('/');
	});

	test('handles utf8', () => {
		const path = '/\u03A9';
		expect(getCanonicalUri(path)).toBe('/%CE%A9');
	});

	test('handles unicode', () => {
		const path = '/👀';
		expect(getCanonicalUri(path)).toBe('/%F0%9F%91%80');
	});

	test('can disable double encoding', () => {
		const encoded = '/%F0%9F%91%80';
		expect(getCanonicalUri(encoded, false)).toBe(encoded);
	});
});
