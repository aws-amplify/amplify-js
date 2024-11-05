// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { toBase64 } from '../../../../../../src/providers/s3/utils/client/runtime/base64/index.native';

import { toBase64TestCases } from './cases';

describe('base64 until for browser', () => {
	describe('toBase64()', () => {
		for (const { input, expected } of toBase64TestCases) {
			it(`it should base64 encode ${input}`, () => {
				expect(toBase64(input)).toStrictEqual(expected);
			});
		}
	});
});
