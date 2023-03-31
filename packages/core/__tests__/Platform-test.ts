import {
	getAmplifyUserAgent,
	getAmplifyUserAgentString,
	Platform,
} from '../src/Platform';
import { version } from '../src/Platform/version';
import { Category, Framework } from '../src/Platform/types';

describe('Platform test', () => {
	describe('isReactNative test', () => {
		test('happy case', () => {
			expect(Platform.isReactNative).toBe(false);
		});
	});

	describe('getAmplifyUserAgent test', () => {
		test('without customUserAgent', () => {
			expect(getAmplifyUserAgent()).toStrictEqual([
				['aws-amplify', version],
				['framework', Framework.None],
			]);
		});

		test('with customUserAgent', () => {
			expect(
				getAmplifyUserAgent({
					category: Category.DataStore,
				})
			).toStrictEqual([
				['aws-amplify', version],
				[Category.DataStore, undefined],
				['framework', Framework.None],
			]);
		});
	});

	describe('getAmplifyUserAgentString test', () => {
		test('without customUserAgent', () => {
			expect(getAmplifyUserAgentString()).toBe(
				`${Platform.userAgent} framework/${Framework.None}`
			);
		});

		test('with customUserAgent', () => {
			expect(getAmplifyUserAgentString({ category: Category.DataStore })).toBe(
				`${Platform.userAgent} ${Category.DataStore} framework/${Framework.None}`
			);
		});
	});
});
