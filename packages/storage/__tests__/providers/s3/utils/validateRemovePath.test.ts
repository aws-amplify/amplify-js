// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { validateRemovePath } from '../../../../src/providers/s3/utils/validateRemovePath';

describe('validateRemovePath', () => {
	describe('valid paths', () => {
		it('should not throw for valid file path', () => {
			expect(() => {
				validateRemovePath('public/file.txt');
			}).not.toThrow();
		});

		it('should not throw for valid folder path', () => {
			expect(() => {
				validateRemovePath('public/folder/');
			}).not.toThrow();
		});

		it('should not throw for nested path', () => {
			expect(() => {
				validateRemovePath('public/nested/folder/file.txt');
			}).not.toThrow();
		});

		it('should not throw for path with special characters', () => {
			expect(() => {
				validateRemovePath('public/file-name_with.special.txt');
			}).not.toThrow();
		});
	});

	describe('invalid paths', () => {
		it('should throw for empty path', () => {
			expect(() => {
				validateRemovePath('');
			}).toThrow('Cannot delete root or bucket-wide paths');
		});

		it('should not throw for path with leading slash', () => {
			expect(() => {
				validateRemovePath('/public/file.txt');
			}).not.toThrow();
		});

		it('should throw for path with only slash', () => {
			expect(() => {
				validateRemovePath('/');
			}).toThrow('Cannot delete root or bucket-wide paths');
		});
	});
});
