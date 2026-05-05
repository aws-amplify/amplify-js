// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Asserts the top-level export surface of `@aws-amplify/storage` as consumed
 * by the `aws-amplify` umbrella package under the `browser` export
 * condition. This complements `exports.test.ts` which runs under the
 * `node` condition and asserts the narrower SSR surface.
 *
 * This file is picked up exclusively by the `browser` Jest project (see
 * `jest.config.js`), which does not override `customExportConditions` —
 * Jest+jsdom's defaults (`['browser', 'development']`) therefore match the
 * `browser` condition in `@aws-amplify/storage`'s `package.json#exports`.
 */

import * as storageTopLevelExports from '../src/storage';

describe('aws-amplify Exports (browser condition)', () => {
	describe('Storage exports', () => {
		it('should expose the full client-side API surface', () => {
			expect(Object.keys(storageTopLevelExports).sort()).toEqual(
				[
					'uploadData',
					'downloadData',
					'remove',
					'list',
					'getProperties',
					'copy',
					'getUrl',
					'isCancelError',
					'StorageError',
					'DEFAULT_PART_SIZE',
				].sort(),
			);
		});
	});
});
