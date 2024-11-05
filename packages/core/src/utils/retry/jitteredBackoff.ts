// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DelayFunction } from '../../types';

import { MAX_DELAY_MS } from './constants';

/**
 * @private
 * Internal use of Amplify only
 */
export function jitteredBackoff(
	maxDelayMs: number = MAX_DELAY_MS,
): DelayFunction {
	const BASE_TIME_MS = 100;
	const JITTER_FACTOR = 100;

	return attempt => {
		const delay = 2 ** attempt * BASE_TIME_MS + JITTER_FACTOR * Math.random();

		return delay > maxDelayMs ? false : delay;
	};
}
