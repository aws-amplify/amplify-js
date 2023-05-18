// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { processExists, windowExists } from './helpers';

// Tested with @angular/core 16.0.0

export function angularWebDetect() {
	return windowExists() && typeof window['ng'] !== 'undefined';
}

export function angularSSRDetect() {
	return (
		(processExists() &&
			typeof process.env === 'object' &&
			process.env['npm_lifecycle_script']?.startsWith('ng ')) ||
		false
	);
}
