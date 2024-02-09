// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSkewCorrectedDate } from './getSkewCorrectedDate';

// 5 mins in milliseconds. Ref: https://github.com/aws/aws-sdk-js-v3/blob/6c0f44fab30a1bb2134af47362a31332abc3666b/packages/middleware-signing/src/utils/isClockSkewed.ts#L10
const SKEW_WINDOW = 5 * 60 * 1000;

/**
 * Checks if the provided date is within the skew window of 5 minutes.
 *
 * @param clockTimeInMilliseconds Time to check for skew in milliseconds.
 * @param clockOffsetInMilliseconds Offset to check clock against in milliseconds.
 *
 * @returns True if skewed. False otherwise.
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
