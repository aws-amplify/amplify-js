// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { selectSsrKeyValueStorage } from '../../src/context/selectSsrKeyValueStorage';
import { CookieStorage, defaultStorage } from '../../src/storage';

describe('selectSsrKeyValueStorage', () => {
	it('returns the shared defaultStorage when ssr is not set', () => {
		expect(selectSsrKeyValueStorage()).toBe(defaultStorage);
		expect(selectSsrKeyValueStorage(undefined)).toBe(defaultStorage);
	});

	it('returns the shared defaultStorage when ssr is false', () => {
		expect(selectSsrKeyValueStorage(false)).toBe(defaultStorage);
	});

	it('returns a cookie-based storage when ssr is true', () => {
		expect(selectSsrKeyValueStorage(true)).toBeInstanceOf(CookieStorage);
	});

	it('returns a FRESH cookie storage per call (matching previous inline behavior)', () => {
		const first = selectSsrKeyValueStorage(true);
		const second = selectSsrKeyValueStorage(true);

		expect(first).not.toBe(second);
	});

	it('configures the SSR cookie storage with sameSite "lax"', () => {
		const storage = selectSsrKeyValueStorage(true);

		// CookieStorage exposes its resolved options as public fields; assert
		// the exact construction the aws-amplify umbrella previously inlined:
		// new CookieStorage({ sameSite: 'lax' }).
		expect(storage).toBeInstanceOf(CookieStorage);
		expect((storage as CookieStorage).sameSite).toBe('lax');
	});
});
