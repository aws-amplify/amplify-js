import {
	retry,
	jitteredExponentialRetry,
	NonRetryableError,
} from '../src/Util/Retry';
import { JobContext } from '../src/Util/JobContext';

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

		const returnValue = await retry(succeedAfterThirdTry, [], () => 1);

		expect(returnValue).toEqual('abc');
		expect(count).toEqual(3);
	});

	test('will not retry if a non-retryable error is returned', async () => {
		function throwsNonRetryableError() {
			throw new NonRetryableError('bwahahahahaha');
		}

		// TODO: how the devil do you get expect().rejects.toThrow to work here?
		try {
			await retry(throwsNonRetryableError, [], () => 1);
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
		await retry(toRetry, ['a', 'b', 'c'], () => 1);

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
			return 1;
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
			return 1;
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

	test('works with JobContext', async () => {
		const context = new JobContext();

		let result;
		let count = 0;
		function inventLightBulb() {
			if (count === 3) {
				return 'Oh hey, we got it!';
			}
			count++;
			throw new Error('Yeah, keep trying, Tom.');
		}

		context
			.add(() => retry(inventLightBulb, [], () => 1))
			.then(r => (result = r));

		await context.exit();

		expect(result).toEqual('Oh hey, we got it!');
		expect(count).toEqual(3);
	});

	test('is cancelable', async () => {
		const context = new JobContext();

		let error;
		let count = 0;

		function suchAFailure() {
			count++;
			throw new Error('I will never succeed.');
		}

		context
			.add(async onTerminate => retry(suchAFailure, [], () => 1, onTerminate))
			.catch(e => (error = e));

		await new Promise(resolve => setTimeout(resolve, 30));
		const countSnapshot = count;

		await context.exit();

		await new Promise(resolve => setTimeout(resolve, 30));

		expect(error).toBeTruthy();
		expect(countSnapshot).toBeGreaterThan(0);
		expect(count).toEqual(countSnapshot);
	});
});

describe('jitteredExponentailRetry', () => {
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

		const returnValue = await jitteredExponentialRetry(
			succeedAfterThirdTry,
			[]
		);

		expect(returnValue).toEqual('abc');
		expect(count).toEqual(3);
	});

	test('will not retry if a non-retryable error is returned', async () => {
		function throwsNonRetryableError() {
			throw new NonRetryableError('bwahahahahaha');
		}

		// TODO: how the devil do you get expect().rejects.toThrow to work here?
		try {
			await jitteredExponentialRetry(throwsNonRetryableError, []);
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
		await jitteredExponentialRetry(toRetry, ['a', 'b', 'c']);

		expect(receivedArgs).toEqual(['a', 'b', 'c']);
	});

	test('is cancelable', async () => {
		const context = new JobContext();

		let error;
		let count = 0;

		function suchAFailure() {
			count++;
			throw new Error('I will never succeed.');
		}

		// retries should be at ~200ms, ~400ms ... we'll try to interrupt
		// between 200 and 400.

		context
			.add(async onTerminate =>
				jitteredExponentialRetry(suchAFailure, [], undefined, onTerminate)
			)
			.catch(e => (error = e));

		await new Promise(resolve => setTimeout(resolve, 300));
		const countSnapshot = count;

		await context.exit();

		// try to wait until after the ~400ms retry would have occurred.
		await new Promise(resolve => setTimeout(resolve, 300));

		expect(error).toBeTruthy();
		expect(countSnapshot).toBeGreaterThan(0);
		expect(count).toEqual(countSnapshot);
	});

	// TODO: test expontential backoff ...
	// (without blowing test execution time up)
});
