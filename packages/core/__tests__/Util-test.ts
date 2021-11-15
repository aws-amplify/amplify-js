'use strict';

import { jitteredExponentialRetry, NonRetryableError } from '../src/Util';
import ReachabilityNative from '../src/Util/Reachability.native';
import Reachability from '../src/Util/Reachability';
import { ConsoleLogger as Logger } from '../src/Logger';
import { urlSafeDecode, urlSafeEncode } from '../src/Util/StringUtils';
import { DateUtils } from '../src/Util/DateUtils';

Logger.LOG_LEVEL = 'DEBUG';

describe('Util', () => {
	beforeEach(() => {});

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
				})
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
				'736f6d652f706174683f746f2d7768617465766572'
			);
		});

		test('urlSafeDecode', () => {
			expect(urlSafeDecode('736f6d652f706174683f746f2d7768617465766572')).toBe(
				'some/path?to-whatever'
			);
		});
	});

	test('jitteredExponential retry happy case', (done) => {
		const resolveAt = 3;
		expect.assertions(3);
		function createRetryableFunction() {
			let attempt = 1;
			return async () => {
				expect(true).toBe(true);
				if (attempt >= resolveAt) {
					done();
					return 'done';
				} else {
					attempt++;
					throw new Error('fail');
				}
			};
		}

		const retryableFunction = createRetryableFunction();

		try {
			jitteredExponentialRetry(retryableFunction, []).then(done);
		} catch (err) {}
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

		expect(testFunc).toBeCalledTimes(1);
	});
	test('Should throw an Error when NetInfo is not passed to networkMonitor in React Native Reachability', () => {
		const subscribe = (netInfo) => {
			new ReachabilityNative().networkMonitor(netInfo);
		};

		function subscribeWithNetInfo() {
			// Pass an object that has a fetch attribute (imitate NetInfo)
			subscribe({ addEventListener: {} });
		}

		expect(subscribe).toThrowError(
			'NetInfo must be passed to networkMonitor to enable reachability in React Native'
		);
		expect(subscribeWithNetInfo).not.toThrowError();
	});
	test('Should not throw an Error when NetInfo is not passed to networkMonitor in Web Reachability', () => {
		const subscribe = () => {
			new Reachability().networkMonitor();
		};

		expect(subscribe).not.toThrowError();
	});
});
