// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { urlSafeDecode, urlSafeEncode } from '../src/utils';

const complexCustomState = 'https://amplify-app:300/?empty=&list=1,a,%,@';

describe('StringUtils', () => {
	test('urlSafe encoding', () => {
		const urlSafeState = urlSafeEncode(complexCustomState);
		expect(encodeURIComponent(urlSafeState)).toEqual(urlSafeState);
	});
	test('urlSafe decoding', () => {
		const urlSafeState = urlSafeEncode(complexCustomState);
		const encodedState = encodeURIComponent(urlSafeState);

		expect(decodeURIComponent(encodedState)).toEqual(encodedState);
	});
	test('URI encode/decode with url safe state', () => {
		const urlSafeState = urlSafeEncode(complexCustomState);
		const encodedState = encodeURIComponent(urlSafeState);

		expect(urlSafeDecode(decodeURIComponent(encodedState))).toEqual(
			complexCustomState,
		);
	});

	describe('non-ASCII input', () => {
		// The hex is the UTF-8 encoding of each string, so a decoder reading two
		// hex digits per byte reproduces it exactly.
		test.each([
			['Latin-1 supplement', 'café', '636166c3a9'],
			['Latin extended-A', 'łódź', 'c582c3b364c5ba'],
			['currency symbol', '€5', 'e282ac35'],
			['CJK', '設定', 'e8a8ade5ae9a'],
			['surrogate pair', '😀', 'f09f9880'],
		])('encodes %s as UTF-8 bytes', (_, input, expected) => {
			expect(urlSafeEncode(input)).toEqual(expected);
		});

		test.each([
			['/pl/łódź'],
			['/ja/設定'],
			['€5'],
			['😀'],
			['{"returnTo":"/pl/łódź"}'],
			[''],
			[complexCustomState],
		])('round trips %p', input => {
			expect(urlSafeDecode(urlSafeEncode(input))).toEqual(input);
		});

		test('encodes every character as url safe hex', () => {
			const encoded = urlSafeEncode('/ja/設定 and 😀');

			expect(encoded).toMatch(/^[0-9a-f]+$/);
		});
	});

	describe('input that is not valid UTF-8', () => {
		// A `state` issued by a version that encoded one UTF-16 code unit per
		// byte, which an OAuth flow spanning an upgrade can still present.
		test('decodes a legacy encoding the way it was written', () => {
			expect(urlSafeDecode('2f6a612f8a2d5b9a')).toEqual('/ja/\x8a-[\x9a');
		});

		test('decodes without throwing', () => {
			expect(() => urlSafeDecode('myState-valid_state')).not.toThrow();
		});
	});
});
