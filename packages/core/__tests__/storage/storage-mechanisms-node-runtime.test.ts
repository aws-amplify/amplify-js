/**
 * @jest-environment node
 */

import {
	AmplifyError,
	AmplifyErrorCode,
	PlatformNotSupportedError,
} from '../../src/libraryUtils';
import {
	defaultStorage,
	sessionStorage,
	syncSessionStorage,
} from '../../src/storage';

const key = 'k';
const value = 'value';

describe('test mechanisms', () => {
	test('test defaultStorage operations in node environment', async () => {
		try {
			await defaultStorage.setItem(key, value);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AmplifyError);
			expect(error.name).toBe(AmplifyErrorCode.PlatformNotSupported);
		}
	});

	test('test sessionStorage operations in node environment', async () => {
		try {
			await sessionStorage.setItem(key, value);
		} catch (error: any) {
			expect(error).toBeInstanceOf(AmplifyError);
			expect(error.name).toBe(AmplifyErrorCode.PlatformNotSupported);
		}
	});

	test('test syncSessionStorage operations in node environment', () => {
		expect(() => {
			syncSessionStorage.setItem(key, value);
		}).not.toThrow(PlatformNotSupportedError);
	});
});
