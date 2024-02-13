// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isClockSkewed } from './isClockSkewed';

/**
 * Returns the difference between clock time and the current system time if clock is skewed.
 *
 * @param clockTimeInMilliseconds Clock time in milliseconds.
 * @param currentSystemClockOffset Current system clock offset in milliseconds.
 *
 * @internal
 */
export const getUpdatedSystemClockOffset = (
	clockTimeInMilliseconds: number,
	currentSystemClockOffset: number,
): number => {
	if (isClockSkewed(clockTimeInMilliseconds, currentSystemClockOffset)) {
		return clockTimeInMilliseconds - Date.now();
	}

	return currentSystemClockOffset;
};
