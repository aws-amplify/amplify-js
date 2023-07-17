// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { globalExists, keyPrefixMatch, windowExists } from './helpers';

// Tested with vue 3.3.2

export function vueWebDetect() {
	return windowExists() && keyPrefixMatch(window, '__VUE');
}
export function vueSSRDetect() {
	return globalExists() && keyPrefixMatch(global, '__VUE');
}
