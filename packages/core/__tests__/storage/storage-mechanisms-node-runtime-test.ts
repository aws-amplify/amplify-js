/**
 * @jest-environment node
 */

import { AmplifyError, AmplifyErrorString } from '../../src/Util/Errors';
import { SessionStorage, LocalStorage } from '../../src/StorageHelper';

const key = 'k';
const value = 'value';

describe('test mechanisms', () => {
	test('test LocalStorage operations in node environment', async () => {
		try {
			await LocalStorage.setItem(key, value);
		} catch (error) {
			expect(error).toBeInstanceOf(AmplifyError);
			expect(error.name).toBe(AmplifyErrorString.PLATFORM_NOT_SUPPORTED_ERROR);
		}
	});

	test('test SessionStorage operations in node environment', async () => {
		try {
			await SessionStorage.setItem(key, value);
		} catch (error) {
			expect(error).toBeInstanceOf(AmplifyError);
			expect(error.name).toBe(AmplifyErrorString.PLATFORM_NOT_SUPPORTED_ERROR);
		}
	});
});
