// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSkewCorrectedDate } from './getSkewCorrectedDate';

const SKEW_WINDOW = 5 * 60 * 1000; // 5 minutes

/**
 * Checks if the provided date is within the skew window of 5 minutes.
 *
 * @param clockTimeInMilliseconds Time to check for skew in milliseconds.
 * @param clockOffsetInMilliseconds Offset to check clock against in milliseconds.
 *
 * @returns True if the difference in time between the checked time and offset is greater than the 5 minute skew window
 * and false otherwise.
 *
 * @internal
 */
export const isClockSkewed = (
	clockTimeInMilliseconds: number,
	clockOffsetInMilliseconds: number
): boolean =>
	Math.abs(
		getSkewCorrectedDate(clockOffsetInMilliseconds).getTime() -
			clockTimeInMilliseconds
	) >= SKEW_WINDOW;
