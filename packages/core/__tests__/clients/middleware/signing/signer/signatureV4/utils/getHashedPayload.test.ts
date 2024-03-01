// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getHashedPayload } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/utils/getHashedPayload';

describe('getHashedPayload', () => {
	test('returns empty hash if nullish', () => {
		expect(getHashedPayload(undefined)).toStrictEqual(
			'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		);
		expect(getHashedPayload(null as any)).toStrictEqual(
			'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		);
	});

	test('returns hashed payload', () => {
		expect(getHashedPayload('string-body')).toStrictEqual(
			'f4241e27b103e1a1d7f88a1556541718250245fe31c8e695f3e068d3fe837572',
		);
	});

	test('works with ArrayBuffer', () => {
		expect(getHashedPayload(new ArrayBuffer(8))).toStrictEqual(
			'af5570f5a1810b7af78caf4bc70a660f0df51e42baf91d4de5b2328de0e83dfc',
		);

		expect(getHashedPayload(new Uint8Array(new ArrayBuffer(8)))).toStrictEqual(
			'af5570f5a1810b7af78caf4bc70a660f0df51e42baf91d4de5b2328de0e83dfc',
		);
	});

	test('returns unsigned payload if not hashable', () => {
		for (const scalar of [123.234, true, new Blob()]) {
			expect(getHashedPayload(scalar as any)).toStrictEqual('UNSIGNED-PAYLOAD');
		}
	});
});
