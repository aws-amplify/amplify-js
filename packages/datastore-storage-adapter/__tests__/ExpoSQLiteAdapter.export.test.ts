// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Test to verify ExpoSQLiteAdapter is properly exported from the package.
 * This addresses the issue where Expo developers couldn't use SQLite because
 * the adapter wasn't exported despite being implemented.
 */

describe('ExpoSQLiteAdapter Export', () => {
	it('should export ExpoSQLiteAdapter from the package', () => {
		// Import from the package index
		const packageExports = require('../src/index');

		// Verify SQLiteAdapter is exported (existing functionality)
		expect(packageExports.SQLiteAdapter).toBeDefined();
		expect(typeof packageExports.SQLiteAdapter).toBe('object');

		// Verify ExpoSQLiteAdapter is now exported (new fix)
		expect(packageExports.ExpoSQLiteAdapter).toBeDefined();
		expect(typeof packageExports.ExpoSQLiteAdapter).toBe('object');
	});

	it('should allow importing ExpoSQLiteAdapter using destructuring', () => {
		// This is how developers will actually import it
		const { ExpoSQLiteAdapter } = require('../src/index');

		expect(ExpoSQLiteAdapter).toBeDefined();
		expect(typeof ExpoSQLiteAdapter).toBe('object');
	});

	it('should be the same adapter from both import methods', () => {
		const { ExpoSQLiteAdapter: destructured } = require('../src/index');
		const packageExports = require('../src/index');
		const direct = packageExports.ExpoSQLiteAdapter;

		// Both import methods should return the same object
		expect(destructured).toBe(direct);
	});
});