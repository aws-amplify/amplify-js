import {
	getAmplifyUserAgent,
	getAmplifyUserAgentString,
	Platform,
} from '../src/Platform';
import { version } from '../src/Platform/version';
import { Category, CategoryAction, Framework } from '../src/Platform/types';

describe('Platform test', () => {
	describe('isReactNative test', () => {
		test('happy case', () => {
			expect(Platform.isReactNative).toBe(false);
		});
	});

	describe('getAmplifyUserAgent test', () => {
		test('without customUserAgent', () => {
			expect(getAmplifyUserAgent()).toBe([
				['aws-amplify', version],
				['framework', Framework.None],
			]);
		});

		test('with customUserAgent', () => {
			expect(
				getAmplifyUserAgent({
					category: Category.DataStore,
					action: CategoryAction.DataStoreJitteredRetry,
				})
			).toBe([
				['aws-amplify', version],
				['category', Category.DataStore],
				[CategoryAction.DataStoreJitteredRetry],
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
				`${Platform.userAgent} category/${Category.DataStore} framework/${Framework.None}`
			);
		});
	});
});
