import { retry, NonRetryableError } from '../src/Util/Retry';

describe('retry', () => {
	test('will retry a function until it succeeds', async () => {
		let count = 0;

		function succeedAfterThirdTry() {
			count++;
			if (count === 3) {
				return 'abc';
			} else {
				throw new Error("Oh no! It didn't work!");
			}
		}

		const returnValue = await retry(succeedAfterThirdTry, [], () => 0.01);

		expect(returnValue).toEqual('abc');
		expect(count).toEqual(3);
	});

	test('will not retry if a non-retryable error is returned', async () => {
		function throwsNonRetryableError() {
			throw new NonRetryableError('bwahahahahaha');
		}

		// TODO: how the devil do you get expect().rejects.toThrow to work here?
		try {
			await retry(throwsNonRetryableError, [], () => 0.01);
			expect(true).toBe(false);
		} catch (error) {
			expect(error.message).toEqual('bwahahahahaha');
		}
	});

	test('passes args to retried function', async () => {
		let receivedArgs;

		function toRetry(...args) {
			receivedArgs = args;
		}
		await retry(toRetry, ['a', 'b', 'c'], () => 0.01);

		expect(receivedArgs).toEqual(['a', 'b', 'c']);
	});

	test('passes attempt number and args to delay function', async () => {
		let attempt = 0;
		let receivedArgs;
		let receivedAttempt;

		function toRetry() {
			// can't succeed on the first attempt or delayFn isn't called.
			if (attempt === 2) {
				return 'ok';
			} else {
				attempt++;
				throw new Error('nope. try again!');
			}
		}

		function delayFunction(attempt, args) {
			receivedAttempt = attempt;
			receivedArgs = args;
			return 0.01;
		}

		await retry(toRetry, ['a', 'b', 'c'], delayFunction);

		expect(receivedAttempt).toEqual(2);
		expect(receivedArgs).toEqual(['a', 'b', 'c']);
	});

	test('stops retrying if delay function returns false', async () => {
		function alwaysFails() {
			throw new Error('not today!');
		}

		let count = 0;
		function retryThreeTimes() {
			if (count === 3) {
				return false;
			}
			count++;
			return 0.01;
		}

		try {
			await retry(alwaysFails, [], retryThreeTimes);

			// retry should eventually throw our 'not today!' error.
			expect(true).toBe(false);
		} catch (error) {
			expect(error.message).toEqual('not today!');
		}

		expect(count).toEqual(3);
	});
});
