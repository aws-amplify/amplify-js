// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { recordToTupleList } from '../../lib/utils';

describe('Record to tuple list', () => {
	const testData: Record<string, number> = {
		1: 1,
		2: 2,
		3: 3,
	};

	it('convert Record to tuple list', () => {
		const result = recordToTupleList(testData);
		expect(result.length).toEqual(Object.keys(testData).length);
		for (const testDataKey in testData) {
			expect(result).toContainEqual([testDataKey, testData[testDataKey]]);
		}
	});
});
