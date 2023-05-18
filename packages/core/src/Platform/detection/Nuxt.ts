// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { globalExists, windowExists } from './helpers';

// Tested with nuxt 2.15 / vue 2.7

export function nuxtWebDetect() {
	return (
		windowExists() &&
		(window['__NUXT__'] !== undefined || window['$nuxt'] !== undefined)
	);
}

export function nuxtSSRDetect() {
	return globalExists() && typeof global['__NUXT_PATHS__'] !== 'undefined';
}
