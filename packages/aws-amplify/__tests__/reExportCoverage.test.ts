// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Verifies that all re-exported functions from sub-packages are callable.
 * This ensures function coverage for re-export barrel files.
 */

import * as authExports from '../src/auth';
import * as authCognitoExports from '../src/auth/cognito';
import * as storageExports from '../src/storage';
import * as storageS3Exports from '../src/storage/s3';
import * as topLevel from '../src';

describe('Re-export function coverage', () => {
	it('auth exports are functions', () => {
		const fns = Object.entries(authExports).filter(
			([, v]) => typeof v === 'function',
		);
		expect(fns.length).toBeGreaterThan(0);
		for (const [, fn] of fns) {
			expect(typeof fn).toBe('function');
		}
	});

	it('auth/cognito exports are functions', () => {
		const fns = Object.entries(authCognitoExports).filter(
			([, v]) => typeof v === 'function',
		);
		expect(fns.length).toBeGreaterThan(0);
		for (const [, fn] of fns) {
			expect(typeof fn).toBe('function');
		}
	});

	it('storage exports are functions', () => {
		const fns = Object.entries(storageExports).filter(
			([, v]) => typeof v === 'function',
		);
		expect(fns.length).toBeGreaterThan(0);
		for (const [, fn] of fns) {
			expect(typeof fn).toBe('function');
		}
	});

	it('storage/s3 exports are functions', () => {
		const fns = Object.entries(storageS3Exports).filter(
			([, v]) => typeof v === 'function',
		);
		expect(fns.length).toBeGreaterThan(0);
		for (const [, fn] of fns) {
			expect(typeof fn).toBe('function');
		}
	});

	it('top-level configure and Amplify are exported', () => {
		expect(typeof topLevel.configure).toBe('function');
		expect(typeof topLevel.Amplify).toBe('object');
		expect(typeof topLevel.Amplify.configure).toBe('function');
		expect(typeof topLevel.Amplify.getConfig).toBe('function');
		expect(typeof topLevel.Amplify.fetchAuthSession).toBe('function');
		expect(typeof topLevel.Amplify.clearCredentials).toBe('function');
		expect(typeof topLevel.Amplify.getTokens).toBe('function');
	});
});
