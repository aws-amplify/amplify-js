// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { FRAMEWORK } from './constants';

export const detectFramework = () => {
	if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
		return FRAMEWORK.ReactNative;
	}
	return FRAMEWORK.None;
};
