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
	beforeAll(() => {
		jest.useFakeTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	beforeEach(() => {
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
					action: ApiAction.None,
				})
			).toBe(
				`${Platform.userAgent} ${Category.API}/${ApiAction.None} framework/${Framework.WebUnknown}`
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
		module = require('../src/Platform/detectFramework');
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
