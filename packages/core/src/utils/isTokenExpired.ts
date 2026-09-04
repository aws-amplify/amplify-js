// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function isTokenExpired({
	expiresAt,
	clockDrift,
	tolerance = 5000,
}: {
	expiresAt: number;
	clockDrift: number;
	tolerance?: number;
}): boolean {
	const currentTime = Date.now();
	// Treat NaN clockDrift as 0 for safety (NaN comparisons always return false)
	const safeClockDrift = Number.isNaN(clockDrift) ? 0 : clockDrift;

	return currentTime + safeClockDrift + tolerance > expiresAt;
}
