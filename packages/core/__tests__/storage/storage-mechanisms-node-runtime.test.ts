/**
 * @jest-environment node
 */

import { AmplifyError, AmplifyErrorCode } from '../../src/libraryUtils';
import { defaultStorage, sessionStorage } from '../../src/storage';

const key = 'k';
const value = 'value';

describe('test mechanisms', () => {
	test('test defaultStorage operations in node environment', async () => {
		try {
			await defaultStorage.setItem(key, value);
		} catch (error) {
			expect(error).toBeInstanceOf(AmplifyError);
			expect(error.name).toBe(AmplifyErrorCode.PlatformNotSupported);
		}
	});

	test('test sessionStorage operations in node environment', async () => {
		try {
			await sessionStorage.setItem(key, value);
		} catch (error) {
			expect(error).toBeInstanceOf(AmplifyError);
			expect(error.name).toBe(AmplifyErrorCode.PlatformNotSupported);
		}
	});
});
