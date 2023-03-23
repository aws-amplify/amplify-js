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
			expect(getAmplifyUserAgent()).toBe(`${Platform.userAgent} {"f":"JS"}`);
		});

		test('with content', () => {
			expect(getAmplifyUserAgent({ category: 'DataStore' })).toBe(
				`${Platform.userAgent} {"f":"JS","c":"DataStore"}`
			);
		});
	});
});
