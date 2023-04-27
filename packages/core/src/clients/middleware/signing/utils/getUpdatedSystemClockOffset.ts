// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isClockSkewed } from './isClockSkewed';

/**
 * Returns the difference between clock time and the current system time if clock is skewed.
 *
 * @param clockTime Clock time as a string.
 * @param currentSystemClockOffset Current system clock offset in milliseconds.
 *
 * @internal
 */
export const getUpdatedSystemClockOffset = (
	clockTime: string,
	currentSystemClockOffset: number
): number => {
	const clockTimeInMs = Date.parse(clockTime);
	if (isClockSkewed(clockTimeInMs, currentSystemClockOffset)) {
		return clockTimeInMs - Date.now();
	}
	return currentSystemClockOffset;
};
