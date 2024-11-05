// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getRandomString } from '../../../../../src/providers/cognito/utils/srp/getRandomString';

describe('getRandomString', () => {
	it('should generate non-deterministic strings', () => {
		const arr: string[] = [];
		for (let i = 0; i < 20; i++) {
			const str = getRandomString();
			arr.push(str);
		}
		expect(arr.length).toBe(new Set(arr).size);
	});
});
