// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Framework } from './types';
import { detectionMap } from './Detection';

// We want to cache detection since the framework won't change
let frameworkCache: Framework;

// TODO on client - maybe caching always won't work because the js hasn't hydrated dom or filled in globals yet.
export const detectFramework = (): Framework => {
	if (!frameworkCache) {
		frameworkCache =
			detectionMap.find(detectionEntry => detectionEntry.detectionMethod())
				?.platform || Framework.ServerSideUnknown;
	}
	return frameworkCache;
};
