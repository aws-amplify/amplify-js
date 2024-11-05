// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getClientInfo } from '../../../src/utils/getClientInfo/getClientInfo';

const testCases: [string, string, object][] = [
	[
		'latest Chrome on Windows',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
		{
			model: 'Chrome',
			version: '119.0.0.0',
		},
	],
	[
		'latest Chrome on macOS',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
		{
			model: 'Chrome',
			version: '119.0.0.0',
		},
	],
	[
		'latest Chrome on Linux',
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
		{
			model: 'Chrome',
			version: '119.0.0.0',
		},
	],
	[
		'latest Chrome on iOS',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.50 Mobile/15E148 Safari/604.1',
		{
			model: 'CriOS',
			version: '120.0.6099.50',
		},
	],
	[
		'Latest Chrome on Android',
		'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.193 Mobile Safari/537.36',
		{
			model: 'Chrome',
			version: '119.0.6045.193',
		},
	],
	[
		'Firefox on Windows',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
		{
			model: 'Firefox',
			version: '120.0',
		},
	],
	[
		'Firefox on macOS',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.1; rv:109.0) Gecko/20100101 Firefox/120.0',
		{
			model: 'Firefox',
			version: '120.0',
		},
	],
	[
		'Firefox on Linux',
		'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0',
		{
			model: 'Firefox',
			version: '120.0',
		},
	],
	[
		'Firefox on Linux',
		'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/120.0',
		{
			model: 'Firefox',
			version: '120.0',
		},
	],
	[
		'Firefox on iOS',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15',
		{
			model: 'FxiOS',
			version: '120.0',
		},
	],
	[
		'Firefox on Android',
		'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/120.0 Firefox/120.0',
		{
			model: 'Firefox',
			version: '120.0',
		},
	],
	[
		'Safari on macOS',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
		{
			model: 'Safari',
			version: '605.1.15',
		},
	],
	[
		'Safari on iOS',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
		{
			model: 'Safari',
			version: '604.1',
		},
	],
	[
		'Edge on Windows',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.2151.97',
		{
			model: 'Edg',
			version: '119.0.2151.97',
		},
	],
	[
		'Edge on macOS',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.2151.97',
		{
			model: 'Edg',
			version: '119.0.2151.97',
		},
	],
	[
		'Edge on Android',
		'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.193 Mobile Safari/537.36 EdgA/119.0.2151.78',
		{
			model: 'EdgA',
			version: '119.0.2151.78',
		},
	],
	[
		'Edge on iOS',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/119.2151.96 Mobile/15E148 Safari/605.1.15',
		{
			model: 'EdgiOS',
			version: '119.2151.96',
		},
	],
	[
		'Opera on Windows',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
		{
			model: 'OPR',
			version: '105.0.0.0',
		},
	],
	[
		'Opera on macOS',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
		{
			model: 'OPR',
			version: '105.0.0.0',
		},
	],
];

describe('getClientInfo', () => {
	let mockNavigator: jest.SpyInstance<typeof window.navigator>;

	beforeAll(() => {
		mockNavigator = jest.spyOn(window, 'navigator', 'get');
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	test.each(testCases)(
		'given %p with user agent: %p, should return %p',
		(_, userAgent, expectedResult) => {
			mockNavigator.mockReturnValueOnce({
				userAgent,
			} as any);
			const result = getClientInfo();
			expect(result).toEqual(expect.objectContaining(expectedResult));
		},
	);
});
