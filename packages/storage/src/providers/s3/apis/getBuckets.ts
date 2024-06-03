// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

/** Bucket to store files/objects */
interface Bucket {
	name: string;
	alias: string;
	region: string;
	isDefault?: boolean;
}

export const getBuckets = (): Bucket[] => {
	const allBuckets = Amplify.getConfig().Storage?.S3.buckets ?? [];

	return allBuckets;
};
