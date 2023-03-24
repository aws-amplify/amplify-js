import { getAmplifyUserAgent, Platform } from '../src/Platform';
import { Category, Framework } from '../src/Platform/types';

describe('Platform test', () => {
	describe('isReactNative test', () => {
		test('happy case', () => {
			expect(Platform.isReactNative).toBe(false);
		});
	});

	describe('getAmplifyUserAgent test', () => {
		test('without content', () => {
			expect(getAmplifyUserAgent()).toBe(
				`${Platform.userAgent} (${Framework.None})`
			);
		});

		test('with content', () => {
			expect(getAmplifyUserAgent({ category: Category.DataStore })).toBe(
				`${Platform.userAgent} (${Category.DataStore},${Framework.None})`
			);
		});
	});
});
