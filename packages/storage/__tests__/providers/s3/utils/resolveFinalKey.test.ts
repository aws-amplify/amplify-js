// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolveFinalKey } from '../../../../src/providers/s3/utils/resolveFinalKey';
import {
	STORAGE_INPUT_KEY,
	STORAGE_INPUT_PATH,
} from '../../../../src/providers/s3/utils/constants';

describe('resolveFinalKey', () => {
	const mockKeyPrefix = 'public/';
	const mockObjectKey = 'test-file.txt';

	describe('with STORAGE_INPUT_KEY', () => {
		it('should return key with prefix', () => {
			const result = resolveFinalKey(
				STORAGE_INPUT_KEY,
				mockObjectKey,
				mockKeyPrefix,
			);
			expect(result).toBe(`${mockKeyPrefix}${mockObjectKey}`);
		});

		it('should handle empty prefix', () => {
			const result = resolveFinalKey(STORAGE_INPUT_KEY, mockObjectKey, '');
			expect(result).toBe(mockObjectKey);
		});

		it('should handle undefined prefix', () => {
			const result = resolveFinalKey(STORAGE_INPUT_KEY, mockObjectKey, '');
			expect(result).toBe(mockObjectKey);
		});
	});

	describe('with STORAGE_INPUT_PATH', () => {
		it('should return object key as-is', () => {
			const result = resolveFinalKey(
				STORAGE_INPUT_PATH,
				mockObjectKey,
				mockKeyPrefix,
			);
			expect(result).toBe(mockObjectKey);
		});

		it('should ignore prefix for path input', () => {
			const result = resolveFinalKey(
				STORAGE_INPUT_PATH,
				'custom/path/file.txt',
				mockKeyPrefix,
			);
			expect(result).toBe('custom/path/file.txt');
		});
	});

	describe('edge cases', () => {
		it('should handle empty object key with key input', () => {
			const result = resolveFinalKey(STORAGE_INPUT_KEY, '', mockKeyPrefix);
			expect(result).toBe(mockKeyPrefix);
		});

		it('should handle empty object key with path input', () => {
			const result = resolveFinalKey(STORAGE_INPUT_PATH, '', mockKeyPrefix);
			expect(result).toBe('');
		});
	});
});
