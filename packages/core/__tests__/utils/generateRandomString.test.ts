// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateRandomString } from '../../src/libraryUtils';

describe('generateRandomString()', () => {
	it('generates a string with the specified length', () => {
		let counter = 0;
		while (counter++ < 50) {
			expect(generateRandomString(20).length).toEqual(20);
		}
	});

	it('generates correct string', () => {
		const mathRandomSpy = jest.spyOn(Math, 'random');
		let counter = 1;
		mathRandomSpy.mockImplementation(() => {
			const returnValue = counter;
			counter += 5;

			return parseFloat(`0.${returnValue}`);
		});

		const result1 = generateRandomString(10);
		counter = 1;
		const result2 = generateRandomString(20);

		expect(result2.substring(0, 10)).toEqual(result1);
	});
});
