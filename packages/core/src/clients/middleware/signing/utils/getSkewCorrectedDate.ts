// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Returns a `Date` that is corrected for clock skew.
 *
 * @param systemClockOffset The offset of the system clock in milliseconds.
 *
 * @returns `Date` representing the current time adjusted by the system clock offset.
 *
 * @internal
 */
export const getSkewCorrectedDate = (systemClockOffset: number): Date =>
	new Date(Date.now() + systemClockOffset);
