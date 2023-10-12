import {
	getAmplifyUserAgentObject,
	getAmplifyUserAgent,
	Platform,
} from '../../src/Platform';
import { version } from '../../src/Platform/version';
import {
	ApiAction,
	AuthAction,
	Category,
	Framework,
} from '../../src/Platform/types';
import {
	detectFramework,
	clearCache,
} from '../../src/Platform/detectFramework';
import * as detection from '../../src/Platform/detection';
import { getCustomUserAgent } from '../../src/Platform/customUserAgent';

jest.mock('../../src/Platform/customUserAgent');

describe('Platform test', () => {
	const mockGetCustomUserAgent = getCustomUserAgent as jest.Mock;

	beforeAll(() => {
		jest.useFakeTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	beforeEach(() => {
		mockGetCustomUserAgent.mockReset();
		clearCache();
	});

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
					category: Category.Auth,
					action: AuthAction.ConfirmSignIn,
				})
			).toStrictEqual([
				['aws-amplify', version],
				[Category.Auth, AuthAction.ConfirmSignIn],
				['framework', Framework.WebUnknown],
			]);
		});

		it('injects global user agent details when available', () => {
			const mockUAState = [['uiversion', '1.0.0'], ['flag']];

			mockGetCustomUserAgent.mockReturnValue(mockUAState);

			expect(
				getAmplifyUserAgentObject({
					category: Category.Auth,
					action: AuthAction.ConfirmSignIn,
				})
			).toStrictEqual([
				['aws-amplify', version],
				[Category.Auth, AuthAction.ConfirmSignIn],
				['framework', Framework.WebUnknown],
				['uiversion', '1.0.0'],
				['flag'],
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
					category: Category.Auth,
					action: AuthAction.ConfirmSignIn,
				})
			).toBe(
				`${Platform.userAgent} ${Category.Auth}/${AuthAction.ConfirmSignIn} framework/${Framework.WebUnknown}`
			);
		});

		it('handles flag UA attributes', () => {
			const mockUAState = [['uiversion', '1.0.0'], ['flag']];

			mockGetCustomUserAgent.mockReturnValue(mockUAState);

			expect(
				getAmplifyUserAgent({
					category: Category.Auth,
					action: AuthAction.ConfirmSignIn,
				})
			).toBe(
				`${Platform.userAgent} ${Category.Auth}/${AuthAction.ConfirmSignIn} framework/${Framework.WebUnknown} uiversion/1.0.0 flag`
			);
		});
	});

	describe('detectFramework', () => {
		test('retries detection after 10ms', () => {
			jest.spyOn(detection, 'detect');

			detectFramework();
			jest.runOnlyPendingTimers();
			detectFramework();
			expect(detection.detect).toHaveBeenCalledTimes(2);
		});
	});
});

describe('detectFramework observers', () => {
	let module;

	beforeAll(() => {
		jest.resetModules();
		module = require('../../src/Platform/detectFramework');
		jest.useFakeTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('it notifies and cleans up the observers and rejects new observer after detection completes', () => {
		const mockObserver = jest.fn();
		module.observeFrameworkChanges(mockObserver);
		expect(module.frameworkChangeObservers.length).toBe(1);

		module.detectFramework();
		expect(mockObserver).toHaveBeenCalledTimes(1);
		jest.runOnlyPendingTimers();
		module.detectFramework();
		expect(mockObserver).toHaveBeenCalledTimes(2);
		expect(module.frameworkChangeObservers.length).toBe(0);

		module.observeFrameworkChanges(mockObserver);
		expect(module.frameworkChangeObservers.length).toBe(0);
	});
});
