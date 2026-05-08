// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	makeCamelCase,
	makeCamelCaseArray,
	blobToArrayBuffer,
} from '../../src/providers/Utils';

describe('Utils', () => {
	describe('makeCamelCase', () => {
		it('converts keys to camel case', () => {
			const obj = { FirstName: 'John', LastName: 'Doe' };
			const result = makeCamelCase(obj);
			expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
		});

		it('returns undefined for undefined input', () => {
			expect(makeCamelCase(undefined)).toBeUndefined();
		});

		it('extracts only specified keys', () => {
			const obj = { FirstName: 'John', LastName: 'Doe', Age: 30 };
			const result = makeCamelCase(obj, ['FirstName', 'LastName']);
			expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
		});
	});

	describe('makeCamelCaseArray', () => {
		it('converts array of objects', () => {
			const arr = [
				{ FirstName: 'John' },
				{ FirstName: 'Jane' },
			];
			const result = makeCamelCaseArray(arr);
			expect(result).toEqual([{ firstName: 'John' }, { firstName: 'Jane' }]);
		});

		it('returns undefined for undefined input', () => {
			expect(makeCamelCaseArray(undefined)).toBeUndefined();
		});
	});

	describe('blobToArrayBuffer', () => {
		it('converts blob to array buffer', async () => {
			const blob = new Blob(['test'], { type: 'text/plain' });
			const result = await blobToArrayBuffer(blob);
			expect(result).toBeDefined();
		});

		it('rejects on invalid input', async () => {
			const invalidBlob = null as any;
			await expect(blobToArrayBuffer(invalidBlob)).rejects.toBeDefined();
		});
	});
});
