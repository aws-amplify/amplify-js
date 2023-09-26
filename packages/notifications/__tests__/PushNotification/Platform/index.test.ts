// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const navigatorSpy = jest.spyOn(global as any, 'navigator', 'get');

const MODULE_PATH = '../../../src/pushNotifications/Platform';

describe('Platform', () => {
	let Platform;
	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	test('returns windows os', () => {
		jest.isolateModules(() => {
			navigatorSpy.mockReturnValue({
				userAgent:
					'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
			});
			Platform = require(MODULE_PATH).Platform;
			expect(Platform.OS).toBe('windows');
		});
	});

	test('returns android', () => {
		jest.isolateModules(() => {
			navigatorSpy.mockReturnValue({
				userAgent:
					'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5563.57 Mobile Safari/537.36',
			});
			Platform = require(MODULE_PATH).Platform;
			expect(Platform.OS).toBe('android');
		});
	});

	test('returns ios', () => {
		jest.isolateModules(() => {
			navigatorSpy.mockReturnValue({
				userAgent:
					'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
			});
			Platform = require(MODULE_PATH).Platform;
			expect(Platform.OS).toBe('ios');
		});
	});

	test('returns mac os', () => {
		jest.isolateModules(() => {
			navigatorSpy.mockReturnValue({
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0',
			});
			Platform = require(MODULE_PATH).Platform;
			expect(Platform.OS).toBe('macos');
		});
	});

	test('returns linux', () => {
		jest.isolateModules(() => {
			navigatorSpy.mockReturnValue({
				userAgent:
					'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
			});
			Platform = require(MODULE_PATH).Platform;
			expect(Platform.OS).toBe('linux');
		});
	});

	test('returns unix', () => {
		jest.isolateModules(() => {
			navigatorSpy.mockReturnValue({
				userAgent:
					'Mozilla/5.0 (X11; CrOS x86_64 15324.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
			});
			Platform = require(MODULE_PATH).Platform;
			expect(Platform.OS).toBe('unix');
		});
	});
});
