// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as fc from 'fast-check';

/**
 * **Feature: native-asf-context-data, Property 5: Module Loader Graceful Degradation**
 * **Validates: Requirements 7.1**
 *
 * Property: For any environment where the @aws-amplify/rtn-asf package is not installed,
 * the loadAmplifyRtnAsf function SHALL return undefined without throwing an exception.
 */
describe('loadAmplifyRtnAsf Property Tests', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('Property 5: Module Loader Graceful Degradation - returns undefined when package not installed', () => {
		fc.assert(
			fc.property(
				// Generate various error types that could occur when module is not installed
				fc.oneof(
					fc.constant(new Error('Cannot find module')),
					fc.constant(new Error('Module not found')),
					fc.constant(new Error('Cannot resolve module')),
					fc.constant(new TypeError('Cannot read property')),
					fc.constant(new ReferenceError('module is not defined')),
					// Additional error messages that could occur
					fc.constant(new Error("Cannot find module '@aws-amplify/rtn-asf'")),
					fc.constant(new Error('Unable to resolve module')),
				),
				error => {
					// Given: The module throws an error when required (simulating not installed)
					jest.doMock('@aws-amplify/rtn-asf', () => {
						throw error;
					});

					// When: loadAmplifyRtnAsf is called
					const {
						loadAmplifyRtnAsf,
					} = require('../src/moduleLoaders/loadAmplifyRtnAsf');
					const result = loadAmplifyRtnAsf();

					// Then: It should return undefined without throwing
					expect(result).toBeUndefined();

					// Cleanup for next iteration
					jest.resetModules();
				},
			),
			{ numRuns: 100 },
		);
	});
});
