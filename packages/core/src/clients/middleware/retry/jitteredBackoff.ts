import type { RetryOptions } from './middleware';
import { jitteredBackoff as jitteredBackoffUtil } from '../../../Util/Retry';

const MAX_DELAY_MS = 5 * 60 * 1000;

export const jitteredBackoff: RetryOptions['computeDelay'] = attempt => {
	const delayFunction = jitteredBackoffUtil();
	const delay = delayFunction(attempt);
	if (delay === false) {
		return MAX_DELAY_MS;
	}
	return delay;
};
