// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { groupBy } from '../../src/utils';

describe('Generic groupBy util function', () => {
	type TestType = {
		x: number;
		y: string;
		z: boolean;
	};

	const testData: TestType[] = [
		{
			x: 1,
			y: 'a',
			z: true,
		},
		{
			x: 1,
			y: 'b',
			z: true,
		},
		{
			x: 2,
			y: 'b',
			z: false,
		},
	];

	it('group list by groupId function', () => {
		const result = groupBy(x => x.y, testData);
		expect(new Set(Object.keys(result))).toEqual(new Set(['a', 'b']));
		expect(result['a'].length).toStrictEqual(1);
		expect(result['a'][0]).toStrictEqual(testData[0]);
		expect(result['b'].length).toStrictEqual(2);
	});
});
