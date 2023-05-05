// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Framework } from './types';
import { detectionMap } from './Detection';

// We want to cache detection since the framework won't change
let frameworkCache: Framework;

export const detectFramework = (): Framework => {
	if (!frameworkCache) {
		frameworkCache =
			detectionMap.find(detectionEntry => detectionEntry.detectionMethod())
				?.platform || Framework.ServerSideUnknown;
	}
	return frameworkCache;
};
