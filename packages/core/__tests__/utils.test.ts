'use strict';

import {
	NonRetryableError,
	jitteredExponentialRetry,
	urlSafeDecode,
	urlSafeEncode,
} from '../src/utils';
import { Reachability as ReachabilityNative } from '../src/Reachability/Reachability.native';
import { Reachability } from '../src/Reachability/Reachability';
import { ConsoleLogger } from '../src/Logger';
import { DateUtils } from '../src/Signer/DateUtils';

ConsoleLogger.LOG_LEVEL = 'DEBUG';

describe('Util', () => {
	describe('DateUtils', () => {
		test('isClockSkewError', () => {
			expect(
				DateUtils.isClockSkewError({
					response: {
						headers: {
							'x-amzn-errortype': 'BadRequestException',
							date: true,
						},
					},
				}),
			).toBeTruthy();
		});

		test('', () => {
			DateUtils.setClockOffset(1000);
			expect(DateUtils.getClockOffset()).toBe(1000);
			DateUtils.setClockOffset(0);
			const date = new Date();
			const header = DateUtils.getHeaderStringFromDate(date);
			const fromHeader = DateUtils.getDateFromHeaderString(header);
			expect(date.toTimeString()).toEqual(fromHeader.toTimeString());
		});
	});

	describe('StringUtils', () => {
		test('urlSafeEncode', () => {
			expect(urlSafeEncode('some/path?to-whatever')).toBe(
				'736f6d652f706174683f746f2d7768617465766572',
			);
		});

		test('urlSafeDecode', () => {
			expect(urlSafeDecode('736f6d652f706174683f746f2d7768617465766572')).toBe(
				'some/path?to-whatever',
			);
		});
	});

	test('jitteredExponential retry happy case', async () => {
		const resolveAt = 3;
		let attempts = 0;
		function createRetryableFunction() {
			return async () => {
				if (attempts >= resolveAt) {
					return 'done';
				} else {
					attempts++;
					throw new Error('Expected failure');
				}
			};
		}

		const retryableFunction = createRetryableFunction();

		try {
			await jitteredExponentialRetry(retryableFunction, []);
			expect(attempts).toEqual(3);
		} catch (err) {
			expect(true).toBe(false);
		}
	});
	test('Fail with NonRetryableError', async () => {
		const nonRetryableError = new NonRetryableError('fatal');
		const testFunc = jest.fn(() => {
			throw nonRetryableError;
		});
		expect.assertions(2);
		try {
			await jitteredExponentialRetry(testFunc, []);
		} catch (err) {
			expect(err).toBe(nonRetryableError);
		}

		expect(testFunc).toHaveBeenCalledTimes(1);
	});
	test('Should throw an Error when NetInfo is not passed to networkMonitor in React Native Reachability', () => {
		const subscribe = netInfo => {
			new ReachabilityNative().networkMonitor(netInfo);
		};

		function subscribeWithNetInfo() {
			// Pass an object that has a fetch attribute (imitate NetInfo)
			subscribe({ addEventListener: {} });
		}

		expect(subscribe).toThrow(
			'NetInfo must be passed to networkMonitor to enable reachability in React Native',
		);
		expect(subscribeWithNetInfo).not.toThrow();
	});
	test('Should not throw an Error when NetInfo is not passed to networkMonitor in Web Reachability', () => {
		const subscribe = () => {
			new Reachability().networkMonitor();
		};

		expect(subscribe).not.toThrow();
	});
});
