// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TextDecoder, TextEncoder } from 'util';

import { toBase64 } from '../../../../../../src/providers/s3/utils/client/runtime/base64/index.browser';

import { toBase64TestCases } from './cases';

Object.assign(global, { TextDecoder, TextEncoder });

describe('base64 until for browser', () => {
	describe('toBase64()', () => {
		for (const { input, expected } of toBase64TestCases) {
			it(`it should base64 encode ${input}`, () => {
				expect(toBase64(input)).toStrictEqual(expected);
			});
		}
	});
});
