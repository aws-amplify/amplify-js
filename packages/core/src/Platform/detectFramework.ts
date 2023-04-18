// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Framework } from './types';

export const detectFramework = () => {
	if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
		return Framework.ReactNative;
	}
	return Framework.None;
};
