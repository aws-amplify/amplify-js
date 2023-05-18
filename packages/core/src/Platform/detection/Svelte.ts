// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { keyPrefixMatch, processExists, windowExists } from './helpers';

// Tested with svelte 3.59

export function svelteWebDetect() {
	return windowExists() && keyPrefixMatch(window, '__SVELTE');
}

export function svelteSSRDetect() {
	return (
		processExists() &&
		typeof process.env !== 'undefined' &&
		!!Object.keys(process.env).find(key => key.includes('svelte'))
	);
}
