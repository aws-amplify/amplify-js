'use strict';

import { jitteredExponentialRetry, NonRetryableError } from '../src/Util';
import { ConsoleLogger as Logger } from '../src/Logger';
Logger.LOG_LEVEL = 'DEBUG';
describe('Util', () => {
	beforeEach(() => {});

	test('jitteredExponential retry happy case', done => {
		const resolveAt = 3;
		expect.assertions(3);
		function createRetryableFunction() {
			let attempt = 1;
			return async () => {
				expect(true).toBe(true);
				if (attempt >= resolveAt) {
					console.log('attempt res');
					done();
					return 'done';
				} else {
					attempt++;
					console.log('attempt rej');
					throw new Error('fail');
				}
			};
		}

		const retryableFunction = createRetryableFunction();

		try {
			jitteredExponentialRetry(retryableFunction, []).then(done);
		} catch (err) {}
		// jest.runAllTimers();
	});
	test('Fail with NonRetryableError', async () => {
		const isNonRetryableError = (obj: any): obj is NonRetryableError =>
			obj instanceof NonRetryableError;
		const nonRetryableError = new NonRetryableError('fatal error');
		isNonRetryableError(nonRetryableError)
			? console.log('non retry')
			: console.log('retry');
		console.log(nonRetryableError.constructor.name);
		const testFunc = jest.fn(() => {
			throw nonRetryableError;
		});
		expect.assertions(1);

		try {
			await jitteredExponentialRetry(testFunc, []);
		} catch (err) {
			// expect(err).toBe(nonRetryableError);
		}
		expect(testFunc).toBeCalledTimes(1);
	});
});
