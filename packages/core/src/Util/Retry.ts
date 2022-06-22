import { DelayFunction } from '../types';
import { ConsoleLogger as Logger } from '../Logger/ConsoleLogger';
const logger = new Logger('Util');

/**
 * An error that indicates an non-transient error that cannot be resolved through a retry alone.
 */
export class NonRetryableError extends Error {
	/**
	 * A field that can be checked to clearly distinguish retryable vs non-retryable
	 * errors at runtime.
	 *
	 * Provided as a field in the event that a `NonRetryableError` is constructed and/or copied
	 * around in any way that breaks `instanceof` checking.
	 */
	public readonly nonRetryable = true;

	/**
	 * Constructs a `NonRetryableError` with a given error message, which is intended
	 * to indicate that an error is non-transient and cannot succeed a retry alone.
	 *
	 * @param message The error message, passed directly to the base `Error`.
	 */
	constructor(message: string) {
		super(message);
	}
}

/**
 * Inspects a given object to see whether it identifies as a non-retryable error.
 *
 * At build time, this should strictly guard for the `NonRetryableError` type. At runtime,
 * this checks an object for evidence that `NonRetryableError` was involved in the
 * construction by looking for a `nonRetryable = true` field on the object.
 *
 * @param obj The object to test.
 * @returns `true` if the given object identifies itself as a non-retryable error;
 * `false` otherwise.
 */
const isNonRetryableError = (obj: any): obj is NonRetryableError => {
	const key: keyof NonRetryableError = 'nonRetryable';
	return obj && obj[key];
};

/**
 * @private
 *
 * Internal use of Amplify only
 *
 * Retries a function on a scheduled provided by a delay function until one of
 * the following occurs:
 *
 * 1. It succeeds.
 * 2. The error thrown is "non-retryable".
 * 3. The indicated delay between retries becomes `false`.
 *
 * If the function fails irrecoverably in any of those cases, `retry()` throws an `Error`.
 *
 * **SIDE EFFECT** / **BACKGROUND PROCESS**
 *
 * Creates a timeout using `setTimeout` for each
 * retry attempt. The generated timeout ID is not exposed or returned in any way.
 *
 * Retry cancellation must be managed outside `retry` by having `functionToRetry`
 * become a no-op and/or by having `delayFn` return `false` when the caller no longer
 * needs the result and/or needs to block further calls against a service.
 *
 * @see isNonRetryableError
 *
 * @param functionToRetry a function to keep trying.
 * @param args arguments to provide the function to keep trying AND the delay
 * calcuation function.
 * @param delayFn the function that calculates how long to wait in ms before the
 * next retry -- should return `false` to stop retrying.
 * @param attempt the attempt number, which is provided by `retry` to itself in
 * subsequent retries and should NOT be provided during the initial invocation.
 * @returns the return value from `functionToRetry`
 */
export async function retry(
	functionToRetry: Function,
	args: any[],
	delayFn: DelayFunction,
	attempt: number = 1
) {
	// We won't "try" something that is not function.
	if (typeof functionToRetry !== 'function') {
		throw Error('functionToRetry must be a function');
	}
	logger.debug(
		`${
			functionToRetry.name
		} attempt #${attempt} with this vars: ${JSON.stringify(args)}`
	);

	try {
		// the caller wants the `functionToRetry`'s return value.
		// so, if we have one (and not an error), we just pass it straight through.
		return await functionToRetry(...args);
	} catch (err) {
		logger.debug(`error on ${functionToRetry.name}`, err);

		// some errors don't make sense to retry.
		// we trust `functionToRetry` to throw the right kind of error, telling us
		// explicitly if a retry is unproductive and/or detrimental.
		if (isNonRetryableError(err)) {
			logger.debug(`${functionToRetry.name} non retryable error`, err);
			throw err;
		}

		// forward thinking: a delay calculation COULD depend on the
		// attempt count, args, and err.
		const retryIn = delayFn(attempt, args, err);
		logger.debug(`${functionToRetry.name} retrying in ${retryIn} ms`);

		if (retryIn !== false) {
			// recursion is easy.
			// TODO: will this blow the stack during an extended *perpetual* retries?
			await new Promise(res => setTimeout(res, retryIn));
			return await retry(functionToRetry, args, delayFn, attempt + 1);
		} else {
			// if we're here, it's because our retry delay function told us to stop retrying
			// by returning an explicit `false`.
			throw err;
		}
	}
}

/**
 * The default maximum time in ms to wait between jitteredBackoff retries.
 */
const MAX_DELAY_MS = 5 * 60 * 1000;

/**
 * @private
 * Internal use of Amplify only
 *
 * Creates a function that can calculates how long to wait before retrying a function
 * using a jittered exponential backoff strategy. If the delay exceeds the given
 * maximum delay, specified in milliseconds, the function will return `false`, indicating
 * that retries should stop.
 *
 * @param maxDelayMs the maximum amount of time in ms to wait between retries.
 * @returns a function that can be used as the `delayFn` for `retry()`
 */
export function jitteredBackoff(
	maxDelayMs: number = MAX_DELAY_MS
): DelayFunction {
	// Values from the Amplify designs.
	// These values should be consistent across platforms and should only be changed
	// after broad internal review and approval.
	const BASE_TIME_MS = 100;
	const JITTER_FACTOR = 100;

	/**
	 * Given an attempt number, calculates the time to wait before the next retry using
	 * a jittered exponentation backoff strategy. If the wait is longer than the given
	 * maximum delay, it returns `false` to indicate retries should stop.
	 */
	return attempt => {
		// Math from the Amplfify designs.
		// This should be consistent across platforms and should only be changed
		// after broad internal review and approval.
		const delay = 2 ** attempt * BASE_TIME_MS + JITTER_FACTOR * Math.random();
		return delay > maxDelayMs ? false : delay;
	};
}

/**
 * @private
 * Internal use of Amplify only
 *
 * Retries a function using a jittered exponentail backoff strategy up to a given
 * (or defaulted) maximum delay, after which retries stop and an error is thrown.
 *
 * Retries also stop if an Error thrown from the function to retry identifies
 * as non-retryable.
 *
 * SIDE EFFECTS / BACKGROUND PROCESS: @see retry
 *
 * @param functionToRetry a function to keep retrying.
 * @param args arguments to provide to the function.
 * @param maxDelayMs maximum amount of time to wait for a retry before aborting.
 * @returns the return value from the function to retry.
 */
export const jitteredExponentialRetry = (
	functionToRetry: Function,
	args: any[],
	maxDelayMs: number = MAX_DELAY_MS
) => retry(functionToRetry, args, jitteredBackoff(maxDelayMs));
