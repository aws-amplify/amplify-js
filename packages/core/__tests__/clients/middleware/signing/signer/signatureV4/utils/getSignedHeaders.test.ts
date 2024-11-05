// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSignedHeaders } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getSignedHeaders';

describe('getSignedHeaders', () => {
	test('lowercases keys', () => {
		const headers = { BAR: 'BAR', fOo: 'fOo' };
		expect(getSignedHeaders(headers)).toBe('bar;foo');
	});

	test('sorts by keys', () => {
		const headers = { baz: 'baz', foo: 'foo', bar: 'bar' };
		expect(getSignedHeaders(headers)).toBe('bar;baz;foo');
	});
});
