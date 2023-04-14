import {
	getAmplifyUserAgent,
	getAmplifyUserAgentString,
	Platform,
} from '../src/Platform';
import { version } from '../src/Platform/version';
import { Category, DataStoreAction, Framework } from '../src/Platform/types';

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

		/* TODO: Replace "DataStoreAction.None" action with actual action */
		test('with customUserAgentDetails', () => {
			expect(
				getAmplifyUserAgent({
					category: Category.DataStore,
					action: DataStoreAction.None,
				})
			).toStrictEqual([
				['aws-amplify', version],
				[Category.DataStore, DataStoreAction.None],
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
					category: Category.DataStore,
					action: DataStoreAction.None,
				})
			).toBe(
				`${Platform.userAgent} ${Category.DataStore}/${DataStoreAction.None} framework/${Framework.None}`
			);
		});
	});
});
