// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Cache instance options
 */
export interface CacheConfig {
	/** Prepend to key to avoid conflicts */
	keyPrefix: string;

	/** Cache capacity, in bytes */
	capacityInBytes: number;

	/** Max size of one item */
	itemMaxSize: number;

	/** Time to live, in milliseconds */
	defaultTTL: number;

	/** Warn when over threshold percentage of capacity, maximum 1 */
	warningThreshold: number;

	/** default priority number put on cached items */
	defaultPriority: number;

	storage?: Storage;
}
