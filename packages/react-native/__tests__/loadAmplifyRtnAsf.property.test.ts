// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as fc from 'fast-check';

/**
 * **Feature: native-asf-context-data, Property 5: Module Loader Graceful Degradation**
 * **Validates: Requirements 7.1**
 */
describe('loadAmplifyRtnAsf Property Tests', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('Property 5: Module Loader Graceful Degradation - returns undefined when package not installed', () => {
		fc.assert(
			fc.property(
				fc.oneof(
					fc.constant(new Error('Cannot find module')),
					fc.constant(new Error('Module not found')),
					fc.constant(new Error('Cannot resolve module')),
					fc.constant(new TypeError('Cannot read property')),
					fc.constant(new ReferenceError('module is not defined')),
					fc.constant(new Error("Cannot find module '@aws-amplify/rtn-asf'")),
					fc.constant(new Error('Unable to resolve module')),
				),
				error => {
					jest.doMock('@aws-amplify/rtn-asf', () => {
						throw error;
					});

					const {
						loadAmplifyRtnAsf,
					} = require('../src/moduleLoaders/loadAmplifyRtnAsf');
					const result = loadAmplifyRtnAsf();

					expect(result).toBeUndefined();

					jest.resetModules();
				},
			),
			{ numRuns: 100 },
		);
	});
});
