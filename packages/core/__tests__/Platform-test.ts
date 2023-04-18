import {
	getAmplifyUserAgent,
	getAmplifyUserAgentString,
	Platform,
} from '../src/Platform';
import { version } from '../src/Platform/version';
import { ApiAction, Category, Framework } from '../src/Platform/types';

describe('Platform test', () => {
	describe('isReactNative test', () => {
		test('happy case', () => {
			expect(Platform.isReactNative).toBe(false);
		});
	});

	describe('getAmplifyUserAgent test', () => {
		test('without customUserAgentDetails', () => {
			expect(getAmplifyUserAgent()).toStrictEqual([
				['aws-amplify', version],
				['framework', Framework.None],
			]);
		});

		/* TODO: test with actual API action */
		test('with customUserAgentDetails', () => {
			expect(
				getAmplifyUserAgent({
					category: Category.API,
					action: ApiAction.None,
				})
			).toStrictEqual([
				['aws-amplify', version],
				[Category.API, ApiAction.None],
				['framework', Framework.None],
			]);
		});
	});

	describe('getAmplifyUserAgentString test', () => {
		test('without customUserAgentDetails', () => {
			expect(getAmplifyUserAgentString()).toBe(
				`${Platform.userAgent} framework/${Framework.None}`
			);
		});

		test('with customUserAgentDetails', () => {
			expect(
				getAmplifyUserAgentString({
					category: Category.API,
					action: ApiAction.None,
				})
			).toBe(
				`${Platform.userAgent} ${Category.API}/${ApiAction.None} framework/${Framework.None}`
			);
		});
	});
});
