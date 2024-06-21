// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { BucketInfo } from '../types/options';

export const getBucket = (alias: string): BucketInfo => {
	const buckets = Amplify.getConfig().Storage?.S3.buckets;
	const foundBucket = buckets && buckets[alias];

	if (!foundBucket) {
		throw new Error(`Bucket with alias ${alias} not found`);
	}

	return foundBucket;
};
