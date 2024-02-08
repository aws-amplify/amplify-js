// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { globalExists, keyPrefixMatch, windowExists } from './helpers';

// Tested with next 13.4 / react 18.2

export function nextWebDetect() {
	return (
		windowExists() &&
		(window as any).next &&
		typeof (window as any).next === 'object'
	);
}

export function nextSSRDetect() {
	return (
		globalExists() &&
		(keyPrefixMatch(global, '__next') || keyPrefixMatch(global, '__NEXT'))
	);
}
