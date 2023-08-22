// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export function getUrlDurationInSeconds(
	awsCredExpiration: Date,
	urlExpiration: number
): number {
	urlExpiration =
		awsCredExpiration.getTime() / 1000 < urlExpiration
			? urlExpiration
			: awsCredExpiration.getTime() / 1000;
	return urlExpiration;
}
