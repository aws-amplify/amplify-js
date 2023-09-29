// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { openAuthSession } from '../../src/utils';

describe('openAuthSession', () => {
	let location = { href: '' };
	const httpsUrl = 'https://example.com';
	const httpUrl = 'http://example.com';
	// create spies
	const windowSpy = jest.spyOn(window, 'window', 'get');
	// create mocks

	beforeAll(() => {
		windowSpy.mockImplementation(() => ({ location } as any));
	});

	beforeEach(() => {
		location = { href: '' };
	});

	afterEach(() => {
		windowSpy.mockClear();
	});

	it('opens the url', () => {
		openAuthSession(httpsUrl, []);
		expect(location.href).toBe(httpsUrl);
	});

	it('enforces https protocol', () => {
		openAuthSession(httpUrl, []);
		expect(location.href).toBe(httpsUrl);
	});
});
