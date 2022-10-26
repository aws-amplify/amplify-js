import { DelayFunction } from '../types';
import { ConsoleLogger as Logger } from '../Logger/ConsoleLogger';
const logger = new Logger('Util');

export class NonRetryableError extends Error {
	public readonly nonRetryable = true;
	constructor(message: string) {
		super(message);
	}
}

export const isNonRetryableError = (obj: any): obj is NonRetryableError => {
	const key: keyof NonRetryableError = 'nonRetryable';
	return obj && obj[key];
};

/**
 * @private
 * Internal use of Amplify only
 */
export async function retry<T>(
	functionToRetry: (...args: any[]) => T,
	args: any[],
	delayFn: DelayFunction,
	onTerminate?: Promise<void>
): Promise<T> {
	if (typeof functionToRetry !== 'function') {
		throw Error('functionToRetry must be a function');
	}

	return new Promise(async (resolve, reject) => {
		let attempt = 0;
		let terminated = false;
		let timeout: any;
		let wakeUp: any = () => {}; // will be replaced with a resolver()

		// used after the loop if terminated while waiting for a timer.
		let lastError: Error;

		onTerminate &&
			onTerminate.then(() => {
				// signal not to try anymore.
				terminated = true;

				// stop sleeping if we're sleeping.
				clearTimeout(timeout);
				wakeUp();
			});

		while (!terminated) {
			attempt++;

			logger.debug(
				`${
					functionToRetry.name
				} attempt #${attempt} with this vars: ${JSON.stringify(args)}`
			);

			try {
				return resolve(await functionToRetry(...args));
			} catch (err) {
				lastError = err;
				logger.debug(`error on ${functionToRetry.name}`, err);

				if (isNonRetryableError(err)) {
					logger.debug(`${functionToRetry.name} non retryable error`, err);
					return reject(err);
				}

				const retryIn = delayFn(attempt, args, err);
				logger.debug(`${functionToRetry.name} retrying in ${retryIn} ms`);

				// we check `terminated` again here because it could have flipped
				// in the time it took `functionToRetry` to return.
				if (retryIn === false || terminated) {
					return reject(err);
				} else {
					await new Promise(r => {
						wakeUp = r; // export wakeUp for onTerminate handling
						timeout = setTimeout(wakeUp, retryIn);
					});
				}
			}
		}

		// reached if terminated while waiting for a timer.
		reject(lastError);
	});
}

const MAX_DELAY_MS = 5 * 60 * 1000;

/**
 * @private
 * Internal use of Amplify only
 */
export function jitteredBackoff(
	maxDelayMs: number = MAX_DELAY_MS
): DelayFunction {
	const BASE_TIME_MS = 100;
	const JITTER_FACTOR = 100;

	return attempt => {
		const delay = 2 ** attempt * BASE_TIME_MS + JITTER_FACTOR * Math.random();
		return delay > maxDelayMs ? false : delay;
	};
}

/**
 * @private
 * Internal use of Amplify only
 */
export const jitteredExponentialRetry = <T>(
	functionToRetry: (...args: any[]) => T,
	args: any[],
	maxDelayMs: number = MAX_DELAY_MS,
	onTerminate?: Promise<void>
): Promise<T> =>
	retry(functionToRetry, args, jitteredBackoff(maxDelayMs), onTerminate);
