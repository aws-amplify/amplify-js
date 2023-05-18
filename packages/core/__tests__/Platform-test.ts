import {
	getAmplifyUserAgent,
	getAmplifyUserAgentString,
	Platform,
} from '../src/Platform';
import { version } from '../src/Platform/version';
import { ApiAction, Category, Framework } from '../src/Platform/types';
import { detectFramework, clearCache } from '../src/Platform/detectFramework';
import * as detection from '../src/Platform/detection';

describe('Platform test', () => {
	beforeEach(() => clearCache());
	describe('isReactNative test', () => {
		test('happy case', () => {
			expect(Platform.isReactNative).toBe(false);
		});
	});

	describe('getAmplifyUserAgent test', () => {
		test('without customUserAgentDetails', () => {
			expect(getAmplifyUserAgent()).toStrictEqual([
				['aws-amplify', version],
				['framework', Framework.WebUnknown],
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
				['framework', Framework.WebUnknown],
			]);
		});
	});

	describe('getAmplifyUserAgentString test', () => {
		test('without customUserAgentDetails', () => {
			expect(getAmplifyUserAgentString()).toBe(
				`${Platform.userAgent} framework/${Framework.WebUnknown}`
			);
		});

		test('with customUserAgentDetails', () => {
			expect(
				getAmplifyUserAgentString({
					category: Category.API,
					action: ApiAction.None,
				})
			).toBe(
				`${Platform.userAgent} ${Category.API}/${ApiAction.None} framework/${Framework.WebUnknown}`
			);
		});
	});

	describe('detectFramework', () => {
		test('retries detection after 10ms', () => {
			jest.useFakeTimers();

			jest.spyOn(detection, 'detect');

			detectFramework();
			jest.runOnlyPendingTimers();
			detectFramework();
			expect(detection.detect).toHaveBeenCalledTimes(2);
		});
	});
});
