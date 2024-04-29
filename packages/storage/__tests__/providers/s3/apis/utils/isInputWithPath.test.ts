// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isInputWithPath } from '../../../../../src/providers/s3/utils';

describe('isInputWithPath', () => {
	it('should return true if input contains path', async () => {
		expect(isInputWithPath({ path: '' })).toBe(true);
	});
	it('should return false if input does not contain path', async () => {
		expect(isInputWithPath({ key: '' })).toBe(false);
	});
});
