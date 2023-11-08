// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DelayFunction } from '../../types';
import { ConsoleLogger } from '../../Logger/ConsoleLogger';
import { isNonRetryableError } from './isNonRetryableError';

const logger = new ConsoleLogger('retryUtil');

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
		let lastError: unknown;

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
