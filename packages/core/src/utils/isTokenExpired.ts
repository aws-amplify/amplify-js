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

	return currentTime + clockDrift + tolerance > expiresAt;
}
