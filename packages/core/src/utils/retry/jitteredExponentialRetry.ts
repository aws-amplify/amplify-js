// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { MAX_DELAY_MS } from './constants';
import { jitteredBackoff } from './jitteredBackoff';
import { retry } from './retry';

/**
 * @private
 * Internal use of Amplify only
 */
export const jitteredExponentialRetry = <T>(
	functionToRetry: (...args: any[]) => T,
	args: any[],
	maxDelayMs: number = MAX_DELAY_MS,
	onTerminate?: Promise<void>,
): Promise<T> =>
	retry(functionToRetry, args, jitteredBackoff(maxDelayMs), onTerminate);
