/**
 * @jest-environment node
 */

import { AmplifyError, AmplifyErrorString } from '../../src/Util/Errors';
import { defaultStorage, sessionStorage } from '../../src/storage';

const key = 'k';
const value = 'value';

describe('test mechanisms', () => {
	test('test defaultStorage operations in node environment', async () => {
		try {
			await defaultStorage.setItem(key, value);
		} catch (error) {
			expect(error).toBeInstanceOf(AmplifyError);
			expect(error.name).toBe(AmplifyErrorString.PLATFORM_NOT_SUPPORTED_ERROR);
		}
	});

	test('test sessionStorage operations in node environment', async () => {
		try {
			await sessionStorage.setItem(key, value);
		} catch (error) {
			expect(error).toBeInstanceOf(AmplifyError);
			expect(error.name).toBe(AmplifyErrorString.PLATFORM_NOT_SUPPORTED_ERROR);
		}
	});
});
