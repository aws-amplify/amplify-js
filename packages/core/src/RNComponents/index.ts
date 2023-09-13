// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isBrowser } from '../Util/JS';
import { StorageHelper } from '../StorageHelper';

export const Linking = {};
export const AppState = {
	addEventListener: (action: any, handler: any) => undefined,
	currentState: 'active',
};

// if not in react native, just use local storage
export const AsyncStorage = isBrowser()
	? new StorageHelper().getStorage()
	: undefined;
