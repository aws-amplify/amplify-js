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
});
