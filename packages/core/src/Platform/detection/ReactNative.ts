// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Tested with react-native 0.17.7

export function reactNativeDetect() {
	return (
		typeof navigator !== 'undefined' &&
		typeof navigator.product !== 'undefined' &&
		navigator.product === 'ReactNative'
	);
}
