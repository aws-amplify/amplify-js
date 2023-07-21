import {
	getAmplifyUserAgentObject,
	getAmplifyUserAgent,
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

	describe('getAmplifyUserAgentObject test', () => {
		test('without customUserAgentDetails', () => {
			expect(getAmplifyUserAgentObject()).toStrictEqual([
				['aws-amplify', version],
				['framework', Framework.WebUnknown],
			]);
		});

		/* TODO: test with actual API action */
		test('with customUserAgentDetails', () => {
			expect(
				getAmplifyUserAgentObject({
					category: Category.API,
					action: ApiAction.GraphQl,
					additionalInfo: [
						['amplify-ui', '1.x.x'],
						['uicomponent', '1'],
					],
				})
			).toStrictEqual([
				['aws-amplify', version],
				[Category.API, ApiAction.GraphQl],
				['framework', Framework.WebUnknown],
				['amplify-ui', '1.x.x'],
				['uicomponent', '1'],
			]);
		});
	});

	describe('getAmplifyUserAgent test', () => {
		test('without customUserAgentDetails', () => {
			expect(getAmplifyUserAgent()).toBe(
				`${Platform.userAgent} framework/${Framework.WebUnknown}`
			);
		});

		test('with customUserAgentDetails', () => {
			expect(
				getAmplifyUserAgent({
					category: Category.API,
					action: ApiAction.GraphQl,
					additionalInfo: [
						['amplify-ui', '1.x.x'],
						['uicomponent', '1'],
					],
				})
			).toBe(
				`${Platform.userAgent} ${Category.API}/${ApiAction.GraphQl} framework/${Framework.WebUnknown} amplify-ui/1.x.x uicomponent/1`
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
