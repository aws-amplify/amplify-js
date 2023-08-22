// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const getUrlDurationInSeconds = function (
	awsCredExpiration: Date,
	urlExpiration: number
): number {
	return awsCredExpiration.getTime() / 1000 < urlExpiration
		? urlExpiration
		: awsCredExpiration.getTime() / 1000;
};
