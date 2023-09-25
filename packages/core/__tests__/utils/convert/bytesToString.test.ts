// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { bytesToString } from '../../../src/utils/convert/base64/bytesToString';

describe('util - bytesToString()', () => {
	it('converts bytes to string', () => {
		const bytes = Uint8Array.from('Hello World', c => c.charCodeAt(0));
		expect(bytesToString(bytes)).toBe('Hello World');
	});
});
