// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { globalExists } from './helpers';

// Tested with expo 48 / react-native 0.71.3

export function expoDetect() {
	// @ts-ignore
	return globalExists() && typeof global['expo'] !== 'undefined';
}
