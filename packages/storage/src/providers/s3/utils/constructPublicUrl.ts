// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Constructs a public S3 URL for objects with public read access.
 * @param bucket - S3 bucket name
 * @param key - Object key
 * @param region - AWS region
 * @returns Public S3 URL
 */
export const constructPublicUrl = (
	bucket: string,
	key: string,
	region: string,
): URL => {
	return new URL(
		`https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`,
	);
};
