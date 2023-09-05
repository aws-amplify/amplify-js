// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getCanonicalQueryString } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getCanonicalQueryString';

describe('getCanonicalQueryString', () => {
	test('sorts by keys and then by values', () => {
		const url = new URL('https://sub.domain?baz=qux&foo=foo&bar=bar&baz=baz');
		expect(getCanonicalQueryString(url.searchParams)).toBe(
			'bar=bar&baz=baz&baz=qux&foo=foo'
		);
	});

	test('encodes both key and value', () => {
		const url = new URL("https://sub.domain?(f!o'o)=*{f o$o}");
		expect(getCanonicalQueryString(url.searchParams)).toBe(
			'%28f%21o%27o%29=%2A%7Bf%20o%24o%7D'
		);
	});
});
