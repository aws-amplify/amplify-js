// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { removeMultiple } from './removeMultiple';

describe('removeMultiple', () => {
	it('should be defined', () => {
		expect(removeMultiple).toBeDefined();
		expect(typeof removeMultiple).toBe('function');
	});

	it('should return operation handle with result, cancel, and isCancelled methods', () => {
		const input = {
			keys: [
				{ key: 'test1.txt' },
				{ key: 'test2.txt', versionId: 'version123' },
			],
			options: {
				batchSize: 500,
				batchStrategy: 'sequential' as const,
				errorHandling: 'continue' as const,
			},
		};

		// This test just verifies the types compile correctly
		expect(() => {
			const operation = removeMultiple(input);
			expect(operation).toHaveProperty('result');
			expect(operation).toHaveProperty('cancel');
			expect(operation).toHaveProperty('isCancelled');
			expect(typeof operation.cancel).toBe('function');
			expect(typeof operation.isCancelled).toBe('function');
			expect(operation.result).toBeInstanceOf(Promise);
		}).not.toThrow();
	});

	it('should support cancellation', () => {
		const input = {
			keys: [{ key: 'test.txt' }],
		};

		const operation = removeMultiple(input);

		// Should not be cancelled initially
		expect(operation.isCancelled()).toBe(false);

		// Cancel the operation
		operation.cancel();

		// Should be cancelled after calling cancel
		expect(operation.isCancelled()).toBe(true);

		// Should be idempotent
		operation.cancel();
		operation.cancel();
		expect(operation.isCancelled()).toBe(true);
	});
});
