import { getAmplifyUserAgent } from '../src/Platform';
import { Platform } from '../src/Platform';

describe('Platform test', () => {
	describe('isReactNative test', () => {
		test('happy case', () => {
			expect(Platform.isReactNative).toBe(false);
		});
	});

	describe('getAmplifyUserAgent test', () => {
		test('without content', () => {
			expect(getAmplifyUserAgent()).toBe(Platform.userAgent);
		});

		test('with content', () => {
			expect(getAmplifyUserAgent('/DataStore')).toBe(
				`${Platform.userAgent}/DataStore`
			);
		});
	});
});
