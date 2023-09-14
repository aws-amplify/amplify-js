// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getDefaultStorageWithFallback } from '../storage/utils';
import { isBrowser } from '../Util/JS';

export const Linking = {};
export const AppState = {
	addEventListener: (action: any, handler: any) => undefined,
	currentState: 'active',
};

// if not in react native, just use local storage
export const AsyncStorage = isBrowser()
	? getDefaultStorageWithFallback()
	: undefined;
