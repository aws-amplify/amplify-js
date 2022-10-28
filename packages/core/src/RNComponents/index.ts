// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { browserOrNode } from '../JS';
import { StorageHelper } from '../StorageHelper';

export const Linking = {};
export const AppState = {
	addEventListener: (action, handler) => undefined,
};

// if not in react native, just use local storage
export const AsyncStorage = browserOrNode().isBrowser
	? new StorageHelper().getStorage()
	: undefined;
