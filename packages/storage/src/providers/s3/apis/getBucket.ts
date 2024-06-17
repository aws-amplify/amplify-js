// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { Bucket } from '../types/options';

export const getBucket = (alias: string): Bucket => {
	const allBuckets = Amplify.getConfig().Storage?.S3.buckets ?? [];
	const foundBucket = allBuckets.find(item => item.alias === alias);

	if (!foundBucket) {
		throw new Error(`Bucket with alias ${alias} not found`);
	}

	return foundBucket;
};
