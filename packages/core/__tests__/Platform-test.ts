import { Category, Framework } from '../src/constants';
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
			expect(getAmplifyUserAgent()).toBe(
				`${Platform.userAgent} (${Framework.None})`
			);
		});

		test('with content', () => {
			const packageDetails = 'amplify-ui/3:1:15';
			expect(
				getAmplifyUserAgent({ category: Category.DataStore, packageDetails })
			).toBe(
				`${Platform.userAgent} ${packageDetails} (${Category.DataStore},${Framework.None})`
			);
		});
	});
});
