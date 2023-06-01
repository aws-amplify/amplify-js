// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RetryOptions } from './middleware';
// TODO: [v6] The separate retry utility is used by Data packages now and will replaced by retry middleware.
import { jitteredBackoff as jitteredBackoffUtil } from '../../../Util/Retry';

const DEFAULT_MAX_DELAY_MS = 5 * 60 * 1000;

export const jitteredBackoff: RetryOptions['computeDelay'] = attempt => {
	const delayFunction = jitteredBackoffUtil(DEFAULT_MAX_DELAY_MS);
	const delay = delayFunction(attempt);
	// The delayFunction returns false when the delay is greater than the max delay(5 mins).
	// In this case, the retry middleware will delay 5 mins instead, as a ceiling of the delay.
	return delay === false ? DEFAULT_MAX_DELAY_MS : delay;
};
