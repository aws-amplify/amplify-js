// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CacheConfig } from './types';

/**
 * Default cache config
 */
export const defaultConfig: Omit<CacheConfig, 'storage'> = {
	keyPrefix: 'aws-amplify-cache',
	capacityInBytes: 1048576, // 1MB
	itemMaxSize: 210000, // about 200kb
	defaultTTL: 259200000, // about 3 days
	defaultPriority: 5,
	warningThreshold: 0.8,
};

export const currentSizeKey = 'CurSize';
